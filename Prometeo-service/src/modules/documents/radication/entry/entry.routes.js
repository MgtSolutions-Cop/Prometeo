import { Router } from "express";
import {
  createEntryRadicationController,
  getInboundListController,
  getPrivateStickerController,
  downloadRadicationPDFController,
  archiveRadicationController,
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

router.put(
  "/:radicationNumber",
  authMiddleware,
  requirePermission("can_radicate_documents"),
  updateRadicationController
);

router.get("/inbound", authMiddleware, getInboundListController);
router.get("/sticker/:filename", authMiddleware, getPrivateStickerController);
router.get("/pdf/:radicationNumber", authMiddleware, downloadRadicationPDFController);
router.patch("/:radicationNumber/archive", authMiddleware, archiveRadicationController);


export default router;