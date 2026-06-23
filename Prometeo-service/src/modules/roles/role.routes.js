import { Router } from "express";
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  toggleRoleState,
} from "./role.controller.js";

import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { requirePermission } from "../../middlewares/permissionMiddleware.js";

const router = Router();

// 1. Capa general: Todos los endpoints aquí requieren estar logueados
router.use(authMiddleware);

// 2. Rutas de lectura (podrían estar disponibles para cualquier usuario logueado o podrías restringirlas también)
router.get("/", getRoles);
router.get("/:id", getRoleById);

// 3. Capa específica: Solo usuarios autorizados pueden modificar o crear roles
router.post("/", requirePermission('can_assign_roles'), createRole);
router.put("/:id", requirePermission('can_assign_roles'), updateRole);
router.patch("/:id/state", requirePermission('can_assign_roles'), toggleRoleState);
export default router;