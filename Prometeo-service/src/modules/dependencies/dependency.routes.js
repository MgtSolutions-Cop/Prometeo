import { Router } from "express";
import {
  getDependenciesController,
  createDependencyController,
  updateDependencyController,
  toggleDependencyController,
  deleteDependencyController,
} from "./dependency.controller.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";
import { requirePermission } from "../../middlewares/permissionMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/",           getDependenciesController);
router.post("/",          requirePermission("can_create_users"), createDependencyController);
router.put("/:id",        requirePermission("can_create_users"), updateDependencyController);
router.patch("/:id/state",requirePermission("can_create_users"), toggleDependencyController);
router.delete("/:id",     requirePermission("can_create_users"), deleteDependencyController);

export default router;