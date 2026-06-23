// src/modules/users/user.controller.js
import * as userServices from "./user.service.js";
import { pool } from "../../config/db.js";
import bcrypt from "bcrypt";

export const createUser = async (req, res) => {
  try {
    const newUser = await userServices.createUser(req.body, req.user.entity_id);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await userServices.getUsers(req.user.entity_id);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserId = async (req, res) => {
  try {
    const user = await userServices.getUserId(req.params.id, req.user.entity_id);
    if (!user) return res.status(404).json({ message: "User not found or belongs to another entity" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const update = await userServices.updateUser(req.params.id, req.body, req.user.entity_id);
    if (!update) return res.status(404).json({ message: "User not found" });
    res.json(update);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const toggleUserState = async (req, res) => {
  try {
    const toggled = await userServices.toggleUserState(req.params.id, req.user.entity_id);
    if (!toggled) return res.status(404).json({ message: "User not found" });
    res.json(toggled);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const changeMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.user_id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Faltan campos requeridos" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Mínimo 6 caracteres" });
    }

    const result = await pool.query(
      "SELECT password_hash FROM users WHERE user_id = $1", [userId]
    );
    if (!result.rows.length) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!valid) {
      return res.status(400).json({ message: "Contraseña actual incorrecta" });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      "UPDATE users SET password_hash = $1 WHERE user_id = $2", [hash, userId]
    );

    return res.json({ message: "Contraseña actualizada correctamente" });
  } catch (err) {
    console.error("changeMyPassword error:", err);
    return res.status(500).json({ message: err.message });
  }
};