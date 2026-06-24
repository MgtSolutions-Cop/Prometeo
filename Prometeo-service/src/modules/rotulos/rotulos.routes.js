import { Router } from "express";
import { getPrivateStickerController } from "./rotulos.controller.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

const router = Router();

// Protegemos la ruta: solo usuarios autenticados pueden ver el PNG del rótulo
router.use(authMiddleware);

// Nueva ruta limpia: /api/rotulos/ver/nombre_archivo.png
router.get("/ver/:filename", getPrivateStickerController);

export default router;