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

const router = Router();

router.post("/",                                  requirePermission("can_radicate_documents"), createEntryRadicationController);
router.get("/inbound",                            getInboundListController);
router.get("/sticker/:filename",                  getPrivateStickerController);
router.get("/pdf/:radicationNumber",              downloadRadicationPDFController);
router.patch("/:radicationNumber/archive",        archiveRadicationController);
router.put("/:radicationNumber",                  requirePermission("can_radicate_documents"), updateRadicationController);

export default router;