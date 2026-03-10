// src/modules/documents/radication/radication.controller.js
import { validateEntryPayload } from "./radication.validations.js";
import { createEntryRadication } from "./radication.service.js";
import { sendEntryNotification } from "./radication.notifications.js"; // veremos abajo (or inline)

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
        text: `Tiene una comunicación de ENTRADA en Prometeo.\nRadicado: ${result.radication.radication_number}\nAsunto: ${payload.asunto}`
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
}

// Export with the name used in routes
export { createEntryRadicationController as createEntryRadication };
