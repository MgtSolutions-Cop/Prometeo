import { Router } from "express";
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
} from "./role.controller.js";

import { authMiddleware } from "../../middlewares/authMiddleware.js"; // cuando lo tengas

const router = Router();

// todas protegidas por token (más adelante)
router.use(authMiddleware);

router.get("/", getRoles);
router.get("/:id", getRoleById);
router.post("/", createRole);
router.put("/:id", updateRole);

export default router;
