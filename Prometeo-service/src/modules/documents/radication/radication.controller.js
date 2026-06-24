import { validateEntryPayload } from "./radication.validations.js";
import { 
  createEntryRadication as createEntryService, 
  getInboundRadications 
} from "./radication.service.js";

import path from "path";
import fs from "fs";


// =============================
// CREAR RADICADO DE ENTRADA
// =============================
export async function createEntryRadicationController(req, res) {
  try {
    const payload = req.body;
    const user = req.user;

    // 1) Validación
    const errors = validateEntryPayload(payload);
    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    // 2) Crear radicado
    const result = await createEntryService(payload, user);

    // 3) Notificación (opcional)
    try {
      const { sendEntryNotification } = await import("./radication.notifications.js");

      const emailPayload = {
        to: payload.correo || null,
        subject: `Nuevo radicado de ENTRADA: ${result.radication.radication_number}`,
        radicationNumber: result.radication.radication_number,
        subjectDoc: payload.subject,
        remitente: payload.remitente || payload.entidad_origen || "N/A"
      };

      sendEntryNotification(emailPayload)
        .catch(e => console.error("Email error:", e));

    } catch (e) {
      console.warn("Notification module error:", e.message);
    }

    // 4) Respuesta
    return res.status(201).json({
      message: "Radication created",
      radication: result.radication,
      document: result.document,
      sticker: result.sticker
    });

  } catch (err) {
    console.error("createEntryRadicationController error:", err);
    return res.status(500).json({ message: "Server error", detail: err.message });
  }
}

// =============================
// CREAR RADICADO DE SALIDA
// =============================
export async function createOutputRadication(req, res) {
  try {
    return res.status(201).json({
      message: "Radicado de salida creado",
      radication: {
        radication_number: "OUT-" + Math.floor(Math.random() * 1000000)
      }
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// =============================
// CREAR RADICADO INTERNO
// =============================
export async function createInternalRadication(req, res) {
  try {
    return res.status(201).json({ 
      message: "Radicado interno creado correctamente" 
    });
  } catch (error) {
    console.error("createInternalRadication error:", error);
    return res.status(500).json({ error: error.message });
  }
}

// =============================
// LISTAR BANDEJA DE ENTRADA
// =============================
export async function getInboundListController(req, res) {
  try {
    const list = await getInboundRadications(req.user.entity_id);
    return res.json(list);
  } catch (err) {
    console.error("Error fetching inbound radications:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// =============================
// SERVIR STICKER PRIVADO
// =============================
export async function getPrivateStickerController(req, res) {
  try {
    const { filename } = req.params;

    const filePath = path.resolve("storage", "stickers", filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Sticker no encontrado" });
    }

    return res.sendFile(filePath);

  } catch (err) {
    console.error("Error serving sticker:", err);
    return res.status(500).json({ message: "Server error" });
  }
}


// =============================
// EXPORT PARA ROUTES
// =============================
export { createEntryRadicationController as createEntryRadication };