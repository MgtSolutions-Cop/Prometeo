import express from "express";
import {login} from "../auth/auth.controller.js"
import { refresh, logout } from "./auth.controller.js";

const router = express.Router();
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;