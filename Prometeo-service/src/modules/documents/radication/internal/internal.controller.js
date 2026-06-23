import { createInternalRadication } from "./internal.service.js";

export async function createInternalRadicationController(req, res) {
  try {
    const result = await createInternalRadication(req.body, req.user);
    return res.status(201).json({
      message: "Radicado interno creado correctamente",
      radication: result.radication,
      document:   result.document,
      sticker:    result.sticker
    });
  } catch (err) {
    console.error("createInternalRadicationController error:", err);
    return res.status(500).json({ message: "Server error", detail: err.message });
  }
}