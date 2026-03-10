import express from "express";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import rolesRouter from "./modules/roles/role.routes.js"
import radicationRoutes from "./modules/documents/radication/radication.routes.js";
const router =express.Router();
//modulo de rutas 
router.use("/auth", authRoutes);
router.use("/users",userRoutes);
router.use("/roles",rolesRouter)
router.use("/documents", radicationRoutes);
export default router; 