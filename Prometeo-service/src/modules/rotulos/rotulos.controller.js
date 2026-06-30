import path from "path";
import fs from "fs";

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