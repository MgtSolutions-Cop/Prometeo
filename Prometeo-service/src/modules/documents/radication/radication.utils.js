import sharp from "sharp";
import bwipjs from "bwip-js";
import fs from "fs/promises";
import path from "path";
import { pool } from "../../../config/db.js";

// src/modules/documents/radication/radication.utils.js

// ======================================================
// 1) GENERAR NÚMERO SECUENCIAL (CON AUTO-SANACIÓN)
// ======================================================
export async function generateRadicationNumber(client, radicationType, entityId) {
  const now = new Date();
  const year = now.getFullYear();

  // 1. Bloqueamos la fila del contador para evitar condiciones de carrera
  const sel = await client.query(
    `SELECT last_seq 
     FROM radication_counters 
     WHERE year = $1 AND radication_type = $2 AND entity_id = $3
     FOR UPDATE`,
    [year, radicationType, entityId]
  );

  let nextSeq = 1;
  if (sel.rows.length > 0) {
    nextSeq = sel.rows[0].last_seq + 1;
  }

  // 2. EL TOQUE DE RESILIENCIA: Verificamos la tabla REAL
  const checkReal = await client.query(
    `SELECT radication_number 
     FROM radications 
     WHERE radication_type = $1 AND entity_id = $2 AND radication_number LIKE $3
     ORDER BY radication_number DESC 
     LIMIT 1`,
    [radicationType, entityId, `${year}-%`]
  );

  if (checkReal.rows.length > 0) {
    // Ej: "2026-000001-IN" -> Extrae el "000001"
    const lastRealNumberStr = checkReal.rows[0].radication_number.split('-')[1];
    const lastRealNumber = parseInt(lastRealNumberStr, 10);
    
    if (lastRealNumber >= nextSeq) {
      nextSeq = lastRealNumber + 1;
    }
  }

  // 3. Actualizamos la tabla contador
  if (sel.rows.length === 0) {
    await client.query(
      `INSERT INTO radication_counters (year, radication_type, entity_id, last_seq)
       VALUES ($1, $2, $3, $4)`,
      [year, radicationType, entityId, nextSeq]
    );
  } else {
    await client.query(
      `UPDATE radication_counters
       SET last_seq = $1
       WHERE year = $2 AND radication_type = $3 AND entity_id = $4`,
      [nextSeq, year, radicationType, entityId]
    );
  }

  // 4. Formateamos el número
  const seqStr = nextSeq.toString().padStart(6, "0");
  return `${year}-${seqStr}-${radicationType}`;
}