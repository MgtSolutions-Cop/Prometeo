import { Router } from "express";
import { createInternalRadicationController } from "./internal.controller.js";
import { requirePermission } from "../../../../middlewares/permissionMiddleware.js";

const router = Router();

router.post("/", requirePermission("can_radicate_documents"), createInternalRadicationController);

export default router;