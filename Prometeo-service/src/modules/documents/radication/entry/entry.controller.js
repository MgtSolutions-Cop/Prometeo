import { validateEntryPayload } from "../shared/radication.validations.js";
import {
  createEntryRadication,
  getInboundRadications,
  generateRadicationPDF,
  archiveRadication,
  unarchiveRadication,
  updateRadication
} from "./entry.service.js";
import path from "path";
import fs from "fs";

export async function createEntryRadicationController(req, res) {
  try {
    const errors = validateEntryPayload(req.body);
    if (errors.length > 0) return res.status(400).json({ message: "Validation failed", errors });

    const result = await createEntryRadication(req.body, req.user);

    try {
      const { sendEntryNotification } = await import("../shared/radication.notifications.js");
      sendEntryNotification({
        to: req.body.correo || null,
        subject: `Nuevo radicado de ENTRADA: ${result.radication.radication_number}`,
        radicationNumber: result.radication.radication_number,
        subjectDoc: req.body.subject,
        remitente: req.body.remitente || req.body.entidad_origen || "N/A"
      }).catch((e) => console.error("Email error:", e));
    } catch (e) {
      console.warn("Notification module error:", e.message);
    }

    return res.status(201).json({
      message: "Radication created",
      radication: result.radication,
      document:   result.document,
      sticker:    result.sticker
    });
  } catch (err) {
    console.error("createEntryRadicationController error:", err);
    return res.status(500).json({ message: "Server error", detail: err.message });
  }
}

export async function getInboundListController(req, res) {
  try {
    const list = await getInboundRadications(req.user.entity_id);
    return res.json(list);
  } catch (err) {
    console.error("Error fetching inbound radications:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function getPrivateStickerController(req, res) {
  try {
    const filePath = path.resolve("storage", "stickers", req.params.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: "Sticker no encontrado" });
    return res.sendFile(filePath);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}

export async function downloadRadicationPDFController(req, res) {
  try {
    const pdfBuffer = await generateRadicationPDF(req.params.radicationNumber, req.user.entity_id);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="Radicado_${req.params.radicationNumber}.pdf"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    return res.end(pdfBuffer);
  } catch (err) {
    return res.status(500).json({ message: err.message || "Error generando PDF" });
  }
}

// ── NUEVO: Archivar radicado ──
export async function archiveRadicationController(req, res) {
  try {
    const { radicationNumber } = req.params;
    const result = await archiveRadication(radicationNumber, req.user.entity_id);
    return res.json({ message: "Radicado archivado correctamente", radication: result });
  } catch (err) {
    console.error("archiveRadicationController error:", err);
    return res.status(500).json({ message: err.message || "Error al archivar" });
  }
}

// ── NUEVO: Editar radicado ──
export async function updateRadicationController(req, res) {
  try {
    const { radicationNumber } = req.params;
    const result = await updateRadication(radicationNumber, req.user.entity_id, req.body);
    return res.json({ message: "Radicado actualizado correctamente", radication: result });
  } catch (err) {
    console.error("updateRadicationController error:", err);
    return res.status(500).json({ message: err.message || "Error al actualizar" });
  }
}

// -- desarchivar radicado --
export async function unarchiveRadicationController(req, res) {
  try {
    const { radicationNumber } = req.params;
    const result = await unarchiveRadication(radicationNumber, req.user.entity_id);
    return res.json({ message: "Radicado desarchivado correctamente", radication: result });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Error al desarchivar" });
  }
}