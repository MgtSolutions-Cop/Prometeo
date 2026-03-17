import { validateEntryPayload } from "./radication.validations.js";
// Traemos los servicios desde su archivo correcto y le ponemos un alias al de crear
import { createEntryRadication as createEntryService, getInboundRadications } from "./radication.service.js";import path from "path";
import fs from "fs";


export async function createEntryRadicationController(req, res) {
  try {
    const payload = req.body;
    const user = req.user; // set by auth middleware

    // 1) Validate payload
    const errors = validateEntryPayload(payload);
    if (errors.length > 0) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    // 2) Create radication
    const result = await createEntryRadication(payload, user);

    // 3) (Optional) send email notification (fire & forget)
    // We'll call a notification util — this can be awaited or not
    try {
      // lazy import to avoid circular deps
      const { sendEntryNotification } = await import("./radication.notifications.js");
      // build minimal email payload
    const emailPayload = {
        to: payload.correo || null,
        subject: `Nuevo radicado de ENTRADA: ${result.radication.radication_number}`,
        radicationNumber: result.radication.radication_number, // ¡La plantilla necesita esto!
        asunto: payload.asunto,                                // ¡Y esto!
        remitente: payload.remitente || payload.entidad_origen || "N/A" // ¡Y esto!
      };
      // don't block response; run but catch errors
      sendEntryNotification(emailPayload).catch(e => console.error("Email error:", e));
    } catch (e) {
      console.warn("Notification module not available or error:", e.message);
    }

    // 4) Return success
    return res.status(201).json({
      message: "Radication created",
      radication: result.radication,
      document: result.document,
      sticker: result.sticker // { filename, filepath, url }
    });

  } catch (err) {
    console.error("createEntryRadicationController error:", err);
    return res.status(500).json({ message: "Server error", detail: err.message });
  }
};
// Controlador para listar la bandeja de entrada
export async function getInboundListController(req, res) {
  try {
    const list = await getInboundRadications(req.user.entity_id);
    return res.json(list);
  } catch (err) {
    console.error("Error fetching inbound radications:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// Controlador para servir el sticker de forma privada
export async function getPrivateStickerController(req, res) {
  try {
    const { filename } = req.params;
    // Construimos la ruta absoluta hacia la carpeta segura
    const filePath = path.resolve("storage", "stickers", filename);
    
    // Verificamos que el archivo exista
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Sticker no encontrado" });
    }
    
    // Si existe y pasó por el middleware de autenticación, se lo enviamos
    return res.sendFile(filePath);
  } catch (err) {
    console.error("Error serving sticker:", err);
    return res.status(500).json({ message: "Server error" });
  }
}
// Export with the name used in routes
export { createEntryRadicationController as createEntryRadication };

