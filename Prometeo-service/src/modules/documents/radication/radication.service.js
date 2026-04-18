import { pool } from "../../../config/db.js";
import { generateRadicationNumber, createStickerPNG } from "./radication.utils.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export async function createEntryRadication(payload, currentUser) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    
    const entityId = currentUser.entity_id;

    // 1) Insert base document (Guardando toda la info del payload en un JSONB 'metadata')
    const docResult = await client.query(
      `INSERT INTO documents
        (subject, content, created_by, dependency_id, entity_id, status, priority, due_date, trd_code, metadata, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())
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
        payload.trd_code || null,
        JSON.stringify(payload) // <-- ¡Aquí salvamos folios, remitente, cedula, etc!
      ]
    );
    const documentId = docResult.rows[0].document_id;

    // 2) Generate radication number (Pasamos el client y el entityId)
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

    // Si todo salió bien, guardamos los cambios de las 4 tablas al mismo tiempo
    await client.query("COMMIT");

    // 5) Generate sticker PNG (Afuera de la transacción de BD)
    const sticker = await createStickerPNG({
      radicationNumber,
      date: new Date().toISOString().slice(0, 19).replace("T", " "),
      tipo: "ENTRADA",
      origen: payload.entidad_origen || payload.remitente || "N/A",
      systemName: "PROMETEO"
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
    // Si ALGO falla, se deshace todo, incluyendo el avance del contador
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

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

//=================================
//funcion para generar PDF radicado
//=================================

export async function generateRadicationPDF(radicationNumber, entityId) {
  // 1) Traer datos completos del radicado
  const result = await pool.query(
    `SELECT 
        r.radication_number,
        r.radication_type,
        r.created_at,
        r.archived,
        d.subject,
        d.status,
        d.metadata,
        dep.name as dependencia_nombre,
        u.full_name as creado_por
     FROM radications r
     JOIN documents d ON r.document_id = d.document_id
     LEFT JOIN dependencies dep ON d.dependency_id = dep.dependency_id
     LEFT JOIN users u ON r.created_by = u.user_id
     WHERE r.radication_number = $1 AND r.entity_id = $2`,
    [radicationNumber, entityId]
  );

  if (result.rows.length === 0) {
    throw new Error("Radicado no encontrado");
  }

  const row = result.rows[0];
  const meta = row.metadata || {};

  // 2) Construir PDF en memoria (Buffer)
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ 
      margin: 50, 
      size: "A4",
      info: { Title: `Radicado ${radicationNumber}`, Author: "Prometeo SGD" }
    });
    
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // ── PALETA ──
    const RED    = "#E53935";
    const BLACK  = "#0a0a0a";
    const GRAY   = "#555555";
    const LGRAY  = "#cccccc";
    const WHITE  = "#ffffff";

    // ── CABECERA ──
    doc.rect(0, 0, doc.page.width, 90).fill(BLACK);

    // Logo/texto marca
    doc.fontSize(22).font("Helvetica-Bold")
       .fillColor(WHITE).text("PROMETEO", 50, 28);
    doc.fontSize(9).font("Helvetica")
       .fillColor(RED).text("SISTEMA DE GESTIÓN DOCUMENTAL", 50, 54);

    // Número de radicado (derecha)
    doc.fontSize(9).font("Helvetica").fillColor(LGRAY)
       .text("N° RADICADO", doc.page.width - 200, 25, { width: 150, align: "right" });
    doc.fontSize(13).font("Helvetica-Bold").fillColor(RED)
       .text(radicationNumber, doc.page.width - 200, 40, { width: 150, align: "right" });

    // ── BANDA DE TIPO ──
    const tipoLabel = 
      row.radication_type === "IN"  ? "ENTRADA" :
      row.radication_type === "OUT" ? "SALIDA"  : "INTERNO";
    const tipoColor =
      row.radication_type === "IN"  ? "#3b82f6" :
      row.radication_type === "OUT" ? "#f59e0b"  : "#8b5cf6";

    doc.rect(0, 90, doc.page.width, 28).fill(tipoColor);
    doc.fontSize(10).font("Helvetica-Bold").fillColor(WHITE)
       .text(`RADICADO DE ${tipoLabel}`, 50, 98);

    const fechaStr = new Date(row.created_at).toLocaleString("es-CO", {
      day: "2-digit", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
    doc.fontSize(9).font("Helvetica").fillColor(WHITE)
       .text(fechaStr, 0, 100, { width: doc.page.width - 50, align: "right" });

    // ── SECCIÓN: INFORMACIÓN DEL RADICADO ──
    let y = 140;

    function sectionTitle(title, yPos) {
      doc.rect(50, yPos, doc.page.width - 100, 22).fill("#f5f5f5");
      doc.rect(50, yPos, 4, 22).fill(RED);
      doc.fontSize(9).font("Helvetica-Bold").fillColor(BLACK)
         .text(title.toUpperCase(), 62, yPos + 6);
      return yPos + 30;
    }

    function field(label, value, x, yPos, width = 220) {
      doc.fontSize(8).font("Helvetica").fillColor(GRAY).text(label, x, yPos);
      doc.fontSize(10).font("Helvetica-Bold").fillColor(BLACK)
         .text(value || "—", x, yPos + 12, { width, lineBreak: false });
      return yPos;
    }

    // Sección 1: Datos del radicado
    y = sectionTitle("Datos del Radicado", y);
    field("Número de radicado", radicationNumber,        50,  y);
    field("Tipo",               tipoLabel,               300, y);
    y += 36;
    field("Fecha de radicación", fechaStr,               50,  y);
    field("Estado",              row.status || "pending",300, y);
    y += 36;
    field("Asunto",              row.subject,            50,  y, 450);
    y += 36;
    field("Dependencia destino", row.dependencia_nombre, 50,  y);
    field("Radicado por",        row.creado_por,         300, y);
    y += 48;

    // Sección 2: Datos del remitente/origen
    y = sectionTitle("Remitente / Origen", y);
    field("Nombre remitente",    meta.remitente,         50,  y);
    field("Cédula / NIT",        meta.cedula_nit,        300, y);
    y += 36;
    field("Entidad / Empresa",   meta.entidad_origen,    50,  y);
    field("Correo electrónico",  meta.correo || "—",     300, y);
    y += 36;
    field("Tipo de documento",   meta.tipo_documento,    50,  y);
    field("Medio correspondencia", meta.medio_correspondencia, 300, y);
    y += 48;

    // Sección 3: Destinatario
    y = sectionTitle("Destinatario", y);
    field("Destinatario específico", meta.destinatario,  50,  y);
    field("Número de folios",    meta.folios || "1",     300, y);
    y += 36;
    if (meta.observaciones) {
      field("Observaciones",     meta.observaciones,     50,  y, 450);
      y += 36;
    }
    y += 12;

    // ── STICKER EMBEBIDO (si existe) ──
    const stickerPath = path.resolve(
      "storage", "stickers", `${radicationNumber}.png`
    );

    if (fs.existsSync(stickerPath)) {
      // Verificar que quede en la página, sino nueva página
      if (y + 160 > doc.page.height - 80) {
        doc.addPage();
        y = 50;
      }
      y = sectionTitle("Rótulo / Sticker de Radicado", y);
      doc.image(stickerPath, 50, y, { width: 250, height: 80 });
      y += 100;
    }

    // ── FIRMAS ──
    if (y + 120 > doc.page.height - 60) {
      doc.addPage();
      y = 50;
    }
    y = Math.max(y + 20, doc.page.height - 180);

    doc.moveTo(50, y).lineTo(250, y).strokeColor(LGRAY).lineWidth(0.5).stroke();
    doc.moveTo(310, y).lineTo(510, y).strokeColor(LGRAY).lineWidth(0.5).stroke();

    doc.fontSize(8).font("Helvetica").fillColor(GRAY)
       .text("Firma del Radicador", 50, y + 6, { width: 200, align: "center" })
       .text("Firma del Receptor", 310, y + 6, { width: 200, align: "center" });

    // ── PIE DE PÁGINA ──
    doc.rect(0, doc.page.height - 40, doc.page.width, 40).fill(BLACK);
    doc.fontSize(7).font("Helvetica").fillColor(LGRAY)
       .text(
         `Prometeo SGD  •  Generado el ${new Date().toLocaleString("es-CO")}  •  Documento oficial`,
         50, doc.page.height - 26,
         { width: doc.page.width - 100, align: "center" }
       );

    doc.end();
  });
}