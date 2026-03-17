import { Router } from "express";
import { createEntryRadication,getInboundListController, getPrivateStickerController } from "./radication.controller.js";
import { authMiddleware } from "../../../middlewares/authMiddleware.js";
import { requirePermission } from "../../../middlewares/permissionMiddleware.js";

const router = Router();

router.use(authMiddleware);

// Endpoint protegido para que solo radicadores puedan ejecutarlo
router.post("/entry", requirePermission('can_radicate_documents'), createEntryRadication);
// Listar bandeja de entrada
router.get("/inbound", getInboundListController);

// Servir sticker protegido (Cualquier usuario logueado puede verlo)
router.get("/sticker/:filename", getPrivateStickerController);
export default router;