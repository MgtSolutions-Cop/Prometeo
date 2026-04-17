import { Router } from "express";
import { 
  createEntryRadication,
  createOutputRadication,
  createInternalRadication,
  getInboundListController,
  getPrivateStickerController
} from "./radication.controller.js";
import { authMiddleware } from "../../../middlewares/authMiddleware.js";
import { requirePermission } from "../../../middlewares/permissionMiddleware.js";

const router = Router();

router.use(authMiddleware);

// Endpoint protegido para que solo radicadores puedan ejecutarlo

// Endpoint entrada

router.post("/entry", requirePermission('can_radicate_documents'), createEntryRadication);

// Endpoint salida

router.post("/output", createOutputRadication);

// Endpoint interno

router.post("/internal", createInternalRadication);

// Listar bandeja de entrada
router.get("/inbound", getInboundListController);

// Servir sticker protegido (Cualquier usuario logueado puede verlo)
router.get("/sticker/:filename", getPrivateStickerController);
export default router;