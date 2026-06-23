// ─────────────────────────────────────────────
// radication.routes.js — Router principal
// Une los 3 módulos de radicación bajo /api/radication
//
// Rutas resultantes:
//   POST   /api/radication/entry
//   GET    /api/radication/entry/inbound
//   GET    /api/radication/entry/sticker/:filename
//   GET    /api/radication/entry/pdf/:radicationNumber
//   POST   /api/radication/output
//   POST   /api/radication/internal
// ─────────────────────────────────────────────
import { Router } from "express";
import { authMiddleware } from "../../../middlewares/authMiddleware.js";
import entryRoutes    from "./entry/entry.routes.js";
import outputRoutes   from "./output/output.routes.js";
import internalRoutes from "./internal/internal.routes.js";

const router = Router();

// Todas las rutas de radicación requieren estar logueado
router.use(authMiddleware);

router.use("/entry",    entryRoutes);
router.use("/output",   outputRoutes);
router.use("/internal", internalRoutes);

export default router;