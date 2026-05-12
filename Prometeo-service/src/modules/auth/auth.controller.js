import {
  loginServices,
  generateAccessToken,
  verifyRefreshToken
} from "./auth.service.js";
import { pool } from "../../config/db.js";

// ─────────────────────────────────────────────
// POST /api/auth/login
// Recibe email y password, valida credenciales,
// establece cookies httpOnly y devuelve los
// datos del usuario + permisos al frontend
// ─────────────────────────────────────────────
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const { accessToken, refreshToken, user } = await loginServices(email, password);

    // ─────────────────────────────────────────────
    // Cookie del Access Token (15 min)
    // httpOnly = JS del navegador no puede leerla
    // secure = solo HTTPS en producción
    // sameSite strict = protección CSRF
    // ─────────────────────────────────────────────
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutos en ms
    });

    // ─────────────────────────────────────────────
    // Cookie del Refresh Token (15 min igual que
    // access por configuración del proyecto)
    // ─────────────────────────────────────────────
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    // Devolvemos el objeto user completo con permisos
    // El frontend lo guardará en localStorage
    return res.json({
      message: "Login successful",
      user, // incluye id, full_name, email, role_id, permissions
    });

  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: error.message || "Invalid credentials" });
  }
}

// ─────────────────────────────────────────────
// POST /api/auth/refresh
// Valida el refreshToken de la cookie,
// busca el usuario en BD y emite un nuevo
// accessToken si todo está en orden
// ─────────────────────────────────────────────
export async function refresh(req, res) {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    // Verificamos que el refresh token sea válido
    const decoded = verifyRefreshToken(token);

    // Verificamos que el usuario sigue activo en BD
    // (puede haber sido desactivado después del login)
    const result = await pool.query(
      "SELECT * FROM users WHERE user_id = $1 AND is_active = true",
      [decoded.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ message: "User is no longer active" });
    }

    // Emitimos un nuevo access token con los datos frescos del usuario
    const newAccessToken = generateAccessToken(result.rows[0]);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    return res.json({ message: "Token refreshed" });

  } catch (error) {
    console.error(error);
    return res.status(403).json({ message: "Invalid refresh token" });
  }
}

// ─────────────────────────────────────────────
// POST /api/auth/logout
// Limpia ambas cookies del navegador
// El frontend también debe limpiar localStorage
// ─────────────────────────────────────────────
export async function logout(req, res) {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  return res.json({ message: "Logged out successfully" });
}

// ─────────────────────────────────────────────
// GET /api/auth/me  ← NUEVO ENDPOINT
// Requiere accessToken válido (via authMiddleware)
// Devuelve los datos frescos del usuario + permisos
// actuales de su rol directo desde BD.
// Útil cuando el admin cambia permisos de un rol
// y el usuario ya logueado necesita actualizarlos
// ─────────────────────────────────────────────
export async function getMe(req, res) {
  try {
    // req.user viene del authMiddleware (token decodificado)
    const { user_id } = req.user;

    // Traemos usuario + su rol en una sola consulta con JOIN
    const result = await pool.query(
      `SELECT 
        u.user_id, u.full_name, u.email, u.role_id,
        u.entity_id, u.dependency_id,
        r.name        AS role_name,
        r.can_create_users,
        r.can_assign_roles,
        r.can_configure_trd,
        r.can_radicate_documents
      FROM users u
      JOIN roles r ON u.role_id = r.role_id
      WHERE u.user_id = $1 AND u.is_active = true`,
      [user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const row = result.rows[0];

    // Estructuramos la respuesta igual que el login
    // para que el frontend pueda actualizar localStorage
    return res.json({
      id: row.user_id,
      full_name: row.full_name,
      email: row.email,
      role_id: row.role_id,
      role_name: row.role_name,
      entity_id: row.entity_id,
      permissions: {
        can_create_users: row.can_create_users,
        can_assign_roles: row.can_assign_roles,
        can_configure_trd: row.can_configure_trd,
        can_radicate_documents: row.can_radicate_documents,
      }
    });

  } catch (error) {
    console.error("getMe error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}