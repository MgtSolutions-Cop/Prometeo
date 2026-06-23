import express from "express";
import { login, refresh, logout, getMe } from "./auth.controller.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

const router = express.Router();

// Rutas públicas — no requieren token
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

// ─────────────────────────────────────────────
// GET /api/auth/me  ← NUEVO
// Protegida con authMiddleware: solo usuarios
// con accessToken válido pueden consultarla.
// El frontend la llama al cargar el dashboard
// para obtener permisos frescos del rol actual
// ─────────────────────────────────────────────
router.get("/me", authMiddleware, getMe);

export default router;