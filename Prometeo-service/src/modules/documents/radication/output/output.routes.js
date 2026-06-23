import { Router } from "express";
import { createOutputRadicationController } from "./output.controller.js";
import { requirePermission } from "../../../../middlewares/permissionMiddleware.js";

const router = Router();

router.post("/", requirePermission("can_radicate_documents"), createOutputRadicationController);

export default router;