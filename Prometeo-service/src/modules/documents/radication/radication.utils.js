import sharp from "sharp";
import bwipjs from "bwip-js";
import fs from "fs/promises";
import path from "path";
import { pool } from "../../../config/db.js";

// ======================================================
// 1) GENERAR NÚMERO SECUENCIAL
// ======================================================
export async function generateRadicationNumber(client, radicationType, entityId) {
  const now = new Date();
  const year = now.getFullYear();

  // Bloqueamos la fila específica de esta entidad para que dos peticiones 
  // simultáneas no obtengan el mismo número.
  const sel = await client.query(
    `SELECT last_seq 
     FROM radication_counters 
     WHERE year = $1 AND radication_type = $2 AND entity_id = $3
     FOR UPDATE`,
    [year, radicationType, entityId]
  );

  let seq = 1;
  if (sel.rows.length === 0) {
    await client.query(
      `INSERT INTO radication_counters (year, radication_type, entity_id, last_seq)
       VALUES ($1, $2, $3, $4)`,
      [year, radicationType, entityId, seq]
    );
  } else {
    seq = sel.rows[0].last_seq + 1;
    await client.query(
      `UPDATE radication_counters
       SET last_seq = $1
       WHERE year = $2 AND radication_type = $3 AND entity_id = $4`,
      [seq, year, radicationType, entityId]
    );
  }

  const seqStr = seq.toString().padStart(6, "0");
  return `${year}-${seqStr}-${radicationType}`;
}
// ======================================================
// 2) GENERAR BUFFER DEL CÓDIGO DE BARRAS
// ======================================================
export async function generateBarcodeBuffer(text) {
  return new Promise((resolve, reject) => {
    bwipjs.toBuffer(
      {
        bcid: "code128",
        text,
        scale: 3,
        height: 12,
        includetext: false,
        backgroundcolor: "FFFFFF",
      },
      (err, png) => {
        if (err) reject(err);
        else resolve(png);
      }
    );
  });
}

// ======================================================
// 3) CREAR PNG DEL STICKER CON SHARP
// ======================================================
export async function createStickerPNG({ radicationNumber, date, tipo, origen, systemName = "PROMETEO" }) {
  
  // --- Fondo blanco ---
  const WIDTH = 420;
  const HEIGHT = 240;

  const blank = {
    create: {
      width: WIDTH,
      height: HEIGHT,
      channels: 3,
      background: { r: 255, g: 255, b: 255 }
    }
  };

  // --- Generar texto como SVG (Sharp lo soporta perfecto) ---
  const svgText = `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .title { font-size: 22px; font-weight: bold; fill: #000; font-family: Arial, sans-serif; }
        .big { font-size: 18px; fill: #000; font-family: Arial, sans-serif; }
        .small { font-size: 14px; fill: #000; font-family: Arial, sans-serif; }
      </style>

      <text x="10" y="30" class="title">${systemName}</text>
      <text x="10" y="65" class="big">Radicado: ${radicationNumber}</text>
      <text x="10" y="95" class="small">Fecha: ${date}</text>
      <text x="10" y="120" class="small">Tipo: ${tipo}</text>
      <text x="10" y="145" class="small">Origen: ${origen}</text>
    </svg>
  `;

  // --- Código de barras ---
  const barcodeBuffer = await generateBarcodeBuffer(radicationNumber);

  // --- Crear imagen final ---
  const barcodeImage = await sharp(barcodeBuffer)
    .resize(360, 60)
    .toBuffer();

  const svgBuffer = Buffer.from(svgText);

  const finalImage = await sharp(blank)
    .composite([
      { input: svgBuffer, top: 0, left: 0 },
      { input: barcodeImage, top: 160, left: 25 }
    ])
    .png()
    .toBuffer();

  // --- Guardar archivo ---
 // En radication.utils.js (dentro de createStickerPNG)

  // --- Guardar archivo de forma PRIVADA ---
  // Cambiamos 'public' por 'storage' (una carpeta que no es accesible directamente)
  const stickersDir = path.resolve("storage", "stickers");
  await fs.mkdir(stickersDir, { recursive: true });

  const filename = `${radicationNumber}.png`;
  const filepath = path.join(stickersDir, filename);

  await fs.writeFile(filepath, finalImage);

  return {
    filename,
    filepath,
    // Esta URL ahora apuntará a nuestro nuevo endpoint protegido
    url: `/api/radication/sticker/${filename}`, 
  };
}
