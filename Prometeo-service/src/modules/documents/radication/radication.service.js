import { pool } from "../../../config/db.js";
import { generateRadicationNumber, createStickerPNG } from "./radication.utils.js";

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
        payload.asunto || "",
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
        subject: payload.asunto
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