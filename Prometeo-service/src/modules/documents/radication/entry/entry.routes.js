import { Router } from "express";
import {
  createEntryRadicationController,
  getInboundListController,
  getPrivateStickerController,
  downloadRadicationPDFController,
  archiveRadicationController,
  unarchiveRadicationController,
  updateRadicationController
} from "./entry.controller.js";
import { requirePermission } from "../../../../middlewares/permissionMiddleware.js";
import { authMiddleware } from "../../../../middlewares/authMiddleware.js";

const router = Router();

router.post(
  "/entry",
  authMiddleware,
  requirePermission("can_radicate_documents"),
  createEntryRadicationController
);

// ── Rutas específicas PRIMERO ──
router.get("/inbound",               authMiddleware, getInboundListController);
router.get("/sticker/:filename",     authMiddleware, getPrivateStickerController);
router.get("/pdf/:radicationNumber", authMiddleware, downloadRadicationPDFController);
router.patch("/:radicationNumber/archive",   authMiddleware, archiveRadicationController);
router.patch("/:radicationNumber/unarchive", authMiddleware, unarchiveRadicationController);

// ── Ruta genérica AL FINAL ──
router.put(
  "/:radicationNumber",
  authMiddleware,
  requirePermission("can_radicate_documents"),
  updateRadicationController
);

export default router;