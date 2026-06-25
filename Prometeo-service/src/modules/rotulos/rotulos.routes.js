import { Router } from "express";
import {
  getPrivateStickerController,
  verificarRadicadoController,
} from "./rotulos.controller.js";
import { authMiddleware } from "../../middlewares/authMiddleware.js";

const router = Router();

// Ruta protegida — ver sticker PNG
router.get("/ver/:filename", authMiddleware, getPrivateStickerController);

// Ruta pública — verificar autenticidad desde QR (sin auth)
router.get("/verificar/:numero", verificarRadicadoController);

export default router;