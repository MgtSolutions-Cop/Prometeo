import { createOutputRadication } from "./output.service.js";

export async function createOutputRadicationController(req, res) {
  try {
    const result = await createOutputRadication(req.body, req.user);
    return res.status(201).json({
      message: "Radicado de salida creado",
      radication: result.radication,
      document:   result.document,
      sticker:    result.sticker
    });
  } catch (err) {
    console.error("createOutputRadicationController error:", err);
    return res.status(500).json({ message: "Server error", detail: err.message });
  }
}