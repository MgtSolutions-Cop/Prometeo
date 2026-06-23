import { pool } from "../../../../config/db.js";
import { generateRadicationNumber, createStickerPNG } from "../shared/radication.utils.js";

export async function createInternalRadication(payload, currentUser) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const entityId = currentUser.entity_id;

    const docResult = await client.query(
      `INSERT INTO documents
        (subject, content, created_by, dependency_id, entity_id, status, priority, metadata, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
       RETURNING document_id`,
      [
        payload.subject || payload.asunto || "",
        payload.observaciones || "",
        currentUser.user_id,
        payload.dependencia_destino || null,
        entityId,
        "pending",
        payload.priority || "normal",
        JSON.stringify(payload)
      ]
    );
    const documentId = docResult.rows[0].document_id;

    const radicationNumber = await generateRadicationNumber(client, "INT", entityId);

    const radResult = await client.query(
      `INSERT INTO radications
        (radication_number, document_id, radication_type, entity_id, created_at, created_by, archived)
       VALUES ($1,$2,$3,$4,NOW(),$5,false)
       RETURNING radication_id, radication_number, created_at`,
      [radicationNumber, documentId, "INT", entityId, currentUser.user_id]
    );

    await client.query(
      `INSERT INTO document_history
        (document_id, user_id, action, action_details, action_date, from_dependency_id, to_dependency_id)
       VALUES ($1,$2,$3,$4,NOW(),$5,$6)`,
      [
        documentId, currentUser.user_id,
        "CREATED_RADICATION", `Radicado interno creado: ${radicationNumber}`,
        currentUser.dependency_id || null, payload.dependencia_destino || null
      ]
    );

    await client.query("COMMIT");

    const sticker = await createStickerPNG({
      radicationNumber,
      date: new Date().toISOString().slice(0, 19).replace("T", " "),
      tipo: "INTERNO",
      origen: currentUser.full_name || "N/A",
      systemName: "PROMETEO"
    });

    return {
      radication: {
        radication_id: radResult.rows[0].radication_id,
        radication_number: radicationNumber,
        created_at: radResult.rows[0].created_at
      },
      document: { document_id: documentId, subject: payload.subject || payload.asunto },
      sticker
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}