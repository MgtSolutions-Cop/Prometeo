import { Router } from "express";
import {
  createUser,
  getUsers,
  getUserId,
  toggleUserState,
  updateUser,
  changeMyPassword,        // ← agregar
} from "./user.controller.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { requirePermission } from "../../middlewares/permissionMiddleware.js";

const router = Router();
router.use(authMiddleware);

router.post("/",        requirePermission('can_create_users'), createUser);
router.get("/",         requirePermission('can_create_users'), getUsers);
router.get("/:id",      requirePermission('can_create_users'), getUserId);
router.patch("/:id/state", requirePermission('can_create_users'), toggleUserState);
router.put("/:id",      requirePermission('can_create_users'), updateUser);
router.patch("/me/password", changeMyPassword);  // ← sin requirePermission, cualquier usuario logueado

export default router;