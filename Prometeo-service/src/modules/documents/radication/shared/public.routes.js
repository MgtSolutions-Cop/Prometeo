import { Router } from "express";
import { verifyRadicationPublic } from "./public.controller.js";

const router = Router();

// Ruta limpia, sin middleware de autenticación
router.get("/verificar/:numero", verifyRadicationPublic);

export default router;