import { pool } from "../../../../config/db.js";

// ==========================================
// CONTROLADOR: VERIFICAR RADICADO (PÚBLICO)
// ==========================================
export async function verifyRadicationPublic(req, res) {
  try {
    const { numero } = req.params;
    
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

    if (result.rows.length === 0) {
      return res.status(404).json({ valid: false, message: "Radicado no encontrado o inválido" });
    }

    const row = result.rows[0];
    const meta = row.metadata || {};
    const anexosText = meta.folios ? `${meta.folios} Folio(s)` : "N/A";

    return res.json({
      valid: true,
      data: {
        numero: row.radication_number,
        fecha: new Date(row.created_at).toLocaleString("es-CO"),
        entidad: row.entidad_nombre || "ALCALDÍA MAYOR DE BOGOTÁ",
        destino: row.dependencia_destino || "N/A",
        anexos: anexosText,
        asunto: meta.subject || "No especificado",
        remitente: meta.remitente || meta.entidad_origen || "N/A"
      }
    });

  } catch (err) {
    console.error("Error verificando radicado público:", err);
    return res.status(500).json({ valid: false, message: "Error interno del servidor" });
  }
}