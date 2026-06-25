import path from "path";
import fs from "fs";
import { pool } from "../../config/db.js";

// ── Servir sticker privado ──
export async function getPrivateStickerController(req, res) {
  try {
    const filePath = path.resolve("storage", "stickers", req.params.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Sticker no encontrado" });
    }
    return res.sendFile(filePath);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}

// ── Verificar autenticidad de un radicado (pública, sin auth) ──
export async function verificarRadicadoController(req, res) {
  try {
    const { numero } = req.params;

    const result = await pool.query(
      `SELECT
         r.radication_number,
         r.created_at,
         r.radication_type,
         d.subject,
         d.status,
         d.metadata,
         dep.name AS dependencia_nombre
       FROM radications r
       JOIN documents d  ON r.document_id    = d.document_id
       LEFT JOIN dependencies dep ON d.dependency_id = dep.dependency_id
       WHERE r.radication_number = $1 AND r.archived = false`,
      [numero]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ valid: false, message: "Radicado no encontrado" });
    }

    const row  = result.rows[0];
    const meta = row.metadata || {};

    return res.json({
      valid: true,
      data: {
        numero:     row.radication_number,
        fecha:      new Date(row.created_at).toLocaleString("es-CO"),
        anexos:     meta.folios || "1",
        entidad:    meta.entidad_origen || "N/A",
        destino:    row.dependencia_nombre || "N/A",
        remitente:  meta.remitente || "N/A",
        asunto:     row.subject,
        tipo:       row.radication_type,
        estado:     row.status,
      },
    });
  } catch (err) {
    console.error("verificarRadicado error:", err);
    return res.status(500).json({ valid: false, message: "Error del servidor" });
  }
}