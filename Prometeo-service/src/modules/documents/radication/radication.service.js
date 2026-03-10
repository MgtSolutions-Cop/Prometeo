// src/modules/documents/radication/radication.service.js
import { pool } from "../../../../src/config/db.js";
import { generateRadicationNumber, createStickerPNG } from "./radication.utils.js";

export async function createEntryRadication(payload, currentUser) {
  // payload: the validated JSON for entry radication
  // currentUser: { user_id, role_id, entity_id, ... } from req.user

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1) Insert base document (documents table)
    const docResult = await client.query(
      `INSERT INTO documents
        (subject, content, created_by, dependency_id, entity_id, status, priority, due_date, trd_code, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW())
       RETURNING document_id`,
      [
        payload.asunto || "",
        payload.observaciones || "",
        currentUser.user_id,
        payload.dependencia_destino,
        currentUser.entity_id || payload.entity_id || 1,
        "pending",
        payload.priority || "normal",
        payload.due_date || null,
        payload.trd_code || null
      ]
    );
    const documentId = docResult.rows[0].document_id;

    // 2) Generate radication number (IN)
    const radicationNumber = await generateRadicationNumber("IN");

    // 3) Insert into radications
    const radResult = await client.query(
      `INSERT INTO radications
        (radication_number, document_id, radication_type, entity_id, created_at, created_by, archived)
       VALUES ($1,$2,$3,$4,NOW(),$5,false)
       RETURNING radication_id, radication_number, created_at`,
      [radicationNumber, documentId, "IN", currentUser.entity_id || 1, currentUser.user_id]
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

    await client.query("COMMIT");

    // 5) Generate sticker PNG (non-db action)
    const sticker = await createStickerPNG({
      radicationNumber,
      date: new Date().toISOString().slice(0, 19).replace("T", " "),
      tipo: "ENTRADA",
      origen: payload.entidad_origen || payload.origen || "N/A",
      systemName: "PROMETEO"
    });

    // Return key data
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
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
