import sharp from "sharp";
import QRCode from "qrcode";
import fs from "fs/promises";
import path from "path";
import { pool } from "../../../../config/db.js";

// ══════════════════════════════════════════════════════
// 1) GENERAR NÚMERO SECUENCIAL (CON AUTO-SANACIÓN)
//    Mejora de Miguel: verifica la tabla real de radicados
//    para evitar duplicados en caso de desincronía
// ══════════════════════════════════════════════════════
export async function generateRadicationNumber(client, radicationType, entityId) {
  const now  = new Date();
  const year = now.getFullYear();

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

  // Auto-sanación: verificar contra la tabla real por si el contador se desincronizó
  const checkReal = await client.query(
    `SELECT radication_number
     FROM radications
     WHERE radication_type = $1 AND entity_id = $2 AND radication_number LIKE $3
     ORDER BY radication_number DESC
     LIMIT 1`,
    [radicationType, entityId, `${year}-%`]
  );

  if (checkReal.rows.length > 0) {
    const lastRealNumberStr = checkReal.rows[0].radication_number.split("-")[1];
    const lastRealNumber    = parseInt(lastRealNumberStr, 10);
    if (lastRealNumber >= nextSeq) {
      nextSeq = lastRealNumber + 1;
    }
  }

  if (sel.rows.length === 0) {
    await client.query(
      `INSERT INTO radication_counters (year, radication_type, entity_id, last_seq)
       VALUES ($1, $2, $3, $4)`,
      [year, radicationType, entityId, nextSeq]
    );
  } else {
    await client.query(
      `UPDATE radication_counters SET last_seq = $1
       WHERE year = $2 AND radication_type = $3 AND entity_id = $4`,
      [nextSeq, year, radicationType, entityId]
    );
  }

  return `${year}-${nextSeq.toString().padStart(6, "0")}-${radicationType}`;
}

// ══════════════════════════════════════════════════════
// 2) CREAR PNG DEL STICKER CON QR
//    Implementación de Miguel: QR con URL de verificación
//    + diseño profesional tipo SGD colombiano
// ══════════════════════════════════════════════════════
const PROMETEO_DOMAIN =
  process.env.PUBLIC_VERIFICATION_URL || "https://prometeofile.com/verificar";

export async function createStickerPNG({
  radicationNumber,
  date,
  tipo,
  origen,
  destinoText,
  anexosText,
  systemName = "PROMETEO",
}) {
  const WIDTH  = 450;
  const HEIGHT = 200;

  const blank = {
    create: {
      width:      WIDTH,
      height:     HEIGHT,
      channels:   3,
      background: { r: 255, g: 255, b: 255 },
    },
  };

  // URL de verificación que va dentro del QR
  const verificationUrl = `${PROMETEO_DOMAIN}/${radicationNumber}`;

  const qrBuffer = await QRCode.toBuffer(verificationUrl, {
    errorCorrectionLevel: "M",
    margin: 1,
    width:  130,
    color:  { dark: "#000000", light: "#FFFFFF" },
  });

  // Texto a la derecha del QR
  const textX = 145;
  const destino  = destinoText  || origen || "N/A";
  const anexos   = anexosText   || "1";

  const svgText = `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <style>
        .bold-title  { font-size:14px; font-weight:bold; fill:#000; font-family:Arial,sans-serif; }
        .subtitle    { font-size:11px; fill:#000; font-family:Arial,sans-serif; }
        .normal      { font-size:13px; fill:#000; font-family:Arial,sans-serif; }
        .bold-normal { font-size:13px; font-weight:bold; fill:#000; font-family:Arial,sans-serif; }
      </style>
      <text x="${textX}" y="30"  class="bold-title">PROMETEO SGD</text>
      <text x="${textX}" y="50"  class="subtitle">SISTEMA DE GESTIÓN DOCUMENTAL</text>
      <text x="${textX}" y="65"  class="subtitle">AL RESPONDER CITAR EL NR.</text>
      <text x="${textX}" y="95"  class="normal">Nro. Rad: <tspan class="bold-normal">${radicationNumber}</tspan></text>
      <text x="${textX}" y="120" class="normal">Fecha: ${date} — Tipo: ${tipo}</text>
      <text x="${textX}" y="145" class="normal">Anexos: ${anexos}</text>
      <text x="${textX}" y="170" class="normal">Destino: <tspan class="bold-normal">${destino}</tspan></text>
    </svg>`;

  const finalImage = await sharp(blank)
    .composite([
      { input: qrBuffer,              top: 35, left: 10 },
      { input: Buffer.from(svgText),  top: 0,  left: 0  },
    ])
    .png()
    .toBuffer();

  const stickersDir = path.resolve("storage", "stickers");
  await fs.mkdir(stickersDir, { recursive: true });

  const filename = `${radicationNumber}.png`;
  await fs.writeFile(path.join(stickersDir, filename), finalImage);

  return {
    filename,
    url: `/api/radication/entry/sticker/${filename}`,
  };
}