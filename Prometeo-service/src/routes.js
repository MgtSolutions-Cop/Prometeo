import express from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import rolesRouter from "./modules/roles/role.routes.js";
import rotulosRoutes from "./modules/rotulos/rotulos.routes.js";
import entryRoutes from "./modules/documents/radication/entry/entry.routes.js";
import dependencyRoutes from "./modules/dependencies/dependency.routes.js";

import publicRadicationRoutes from "./modules/documents/radication/shared/public.routes.js";

const router = express.Router();

// Módulos Generales
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/roles", rolesRouter);
router.use("/rotulos", rotulosRoutes);
router.use("/dependencies", dependencyRoutes);
// ==========================================
// MÓDULO DE RADICACIÓN
// ==========================================

// QR publico
router.use("/radication", publicRadicationRoutes);

// Privadas
router.use("/radication", entryRoutes);



export default router;