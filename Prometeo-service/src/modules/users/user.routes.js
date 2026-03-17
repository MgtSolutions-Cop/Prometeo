import { Router } from "express";
import {
    createUser,
    getUsers,
    getUserId,
    toggleUserState,
    updateUser
} from "./user.controller.js";

import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { requirePermission } from "../../middlewares/permissionMiddleware.js";

const router = Router();

router.use(authMiddleware);

// Solo quienes tengan can_create_users pueden interactuar con estas rutas
router.post("/", requirePermission('can_create_users'), createUser);
router.get("/", requirePermission('can_create_users'), getUsers);
router.get("/:id", requirePermission('can_create_users'), getUserId);
router.patch("/:id/state", requirePermission('can_create_users'), toggleUserState);
router.put("/:id", requirePermission('can_create_users'), updateUser);

export default router;