import { pool } from "../../../config/db.js";
import fs from "fs";
import path from "path";
import { generateRadicationNumber } from "./radication.utils.js"; 
import { createStickerPNG } from "../../rotulos/rotulos.service.js"; 

export async function createEntryRadication(payload, currentUser) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    const entityId = currentUser.entity_id;

    // 1) Insert base document
    const docResult = await client.query(
      `INSERT INTO documents
        (subject, content, created_by, dependency_id, entity_id, status, priority, due_date, metadata, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
       RETURNING document_id`,
      [
        payload.subject || "",
        payload.observaciones || "",
        currentUser.user_id,
        payload.dependencia_destino,
        entityId,
        "pending",
        payload.priority || "normal",
        payload.due_date || null,
        JSON.stringify(payload)
      ]
    );
    const documentId = docResult.rows[0].document_id;

    // 2) Generate radication number
    const radicationNumber = await generateRadicationNumber(client, "IN", entityId);

    // 3) Insert into radications
    const radResult = await client.query(
      `INSERT INTO radications
        (radication_number, document_id, radication_type, entity_id, created_at, created_by, archived)
       VALUES ($1,$2,$3,$4,NOW(),$5,false)
       RETURNING radication_id, radication_number, created_at`,
      [radicationNumber, documentId, "IN", entityId, currentUser.user_id]
    );
    const radicationRow = radResult.rows[0];

    // 4) Insert initial traceability
    await client.query(
      `INSERT INTO document_history
        (document_id, user_id, action, action_details, action_date, from_dependency_id, to_dependency_id)
       VALUES ($1,$2,$3,$4,NOW(),$5,$6)`,
      [
        documentId,
        currentUser.user_id,
        "CREATED_RADICATION",
        `Radicado creado: ${radicationNumber}`,
        currentUser.dependency_id || null,
        payload.dependencia_destino || null
      ]
    );

    // TRADUCTOR DE ID A TEXTO PARA EL RÓTULO
    let destinoText = "N/A";
    if (payload.dependencia_destino) {
      // Ajusta 'dependencies' y 'name' si los nombres de tu tabla o columna son diferentes
      const depResult = await client.query(
        "SELECT name FROM dependencies WHERE dependency_id = $1", 
        [payload.dependencia_destino]
      );
      if (depResult.rows.length > 0) {
        destinoText = depResult.rows[0].name; // Ej: "Secretaría General"
      }
    }

    // Calcular qué decir en anexos
    const anexosText = payload.folios ? `${payload.folios} Folio(s)` : "N/A";

    // Confirmamos la transacción en la base de datos
    await client.query("COMMIT");

    // 5) Generar el Sticker QR (Delegado al módulo de rótulos)
    const sticker = await createStickerPNG({
      radicationNumber,
      date: new Date().toISOString().slice(0, 10), // Formato YYYY-MM-DD
      destinoText,
      anexosText
      // Entidad usa el valor por defecto que le pusimos en el servicio
    });

    return {
      radication: {
        radication_id: radicationRow.radication_id,
        radication_number: radicationRow.radication_number,
        created_at: radicationRow.created_at
      },
      document: {
        document_id: documentId,
        subject: payload.subject
      },
      sticker
    };

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function createOutputRadication(payload, user) {
  return createRadicationBase(payload, user, "OUT");
}

export async function createInternalRadication(payload, user) {
  return createRadicationBase(payload, user, "INT");
}
// En radication.service.js
// Traeremos el número, el asunto, el estado, la fecha y el remitente (del JSONB)
export async function getInboundRadications(entityId) {
  const result = await pool.query(
    `SELECT 
        r.radication_number, 
        r.created_at, 
        d.subject, 
        d.status, 
        d.metadata->>'remitente' as remitente 
     FROM radications r
     JOIN documents d ON r.document_id = d.document_id
     WHERE r.radication_type = 'IN' AND r.entity_id = $1
     ORDER BY r.created_at DESC`,
    [entityId]
  );
  return result.rows;
}
// ==========================================
// SERVICIO: OBTENER DATOS PÚBLICOS DE RADICADO
// ==========================================
export async function getRadicationPublicData(numero) {
  const result = await pool.query(
    `SELECT 
      r.radication_number,
      r.created_at,
      d.metadata,
      dep.name AS dependencia_destino,
      ent.name AS entidad_nombre
     FROM radications r
     JOIN documents d ON r.document_id = d.document_id
     LEFT JOIN dependencies dep ON d.dependency_id = dep.dependency_id
     LEFT JOIN entities ent ON r.entity_id = ent.entity_id
     WHERE r.radication_number = $1`,
    [numero]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  const meta = row.metadata || {};
  const anexosText = meta.folios ? `${meta.folios} Folio(s)` : "N/A";

  return {
    numero: row.radication_number,
    fecha: new Date(row.created_at).toLocaleString("es-CO"),
    entidad: row.entidad_nombre || "ALCALDÍA MAYOR DE BOGOTÁ",
    destino: row.dependencia_destino || "N/A",
    anexos: anexosText,
    asunto: meta.subject || "No especificado",
    remitente: meta.remitente || meta.entidad_origen || "N/A"
  };
}
