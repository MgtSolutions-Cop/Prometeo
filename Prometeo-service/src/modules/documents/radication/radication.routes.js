// src/modules/documents/radication/radication.routes.js
import { Router } from "express";
import {
  createEntryRadication
} from "./radication.controller.js";
import { authMiddleware } from "../../../middlewares/authMiddleware.js";

const router = Router();

// Protegemos con authenticate (token en cookie)
router.use(authMiddleware);

// Endpoint: crear radicado de ENTRADA
router.post("/entry", createEntryRadication);

// (En el futuro se agregarán /output y /memo con la misma lógica)
export default router;
