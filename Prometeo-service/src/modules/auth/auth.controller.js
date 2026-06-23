import {
  loginServices,
  generateAccessToken,
  verifyRefreshToken,
} from "./auth.service.js";
import { pool } from "../../config/db.js";

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const { accessToken, refreshToken, user } = await loginServices(email, password);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    return res.json({ message: "Login successful", user });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: error.message || "Invalid credentials" });
  }
}

export async function refresh(req, res) {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    const decoded = verifyRefreshToken(token);
    const result = await pool.query(
      "SELECT * FROM users WHERE user_id = $1 AND is_active = true",
      [decoded.user_id]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ message: "User is no longer active" });
    }

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

export async function logout(req, res) {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  return res.json({ message: "Logged out successfully" });
}

// ─────────────────────────────────────────────
// GET /api/auth/me
// Devuelve permisos efectivos (override > rol)
// ─────────────────────────────────────────────
export async function getMe(req, res) {
  try {
    const { user_id } = req.user;

    const userResult = await pool.query(
      `SELECT
         u.user_id, u.full_name, u.email, u.role_id,
         u.entity_id, u.dependency_id,
         r.name AS role_name,
         r.can_create_users      AS role_can_create_users,
         r.can_assign_roles      AS role_can_assign_roles,
         r.can_configure_trd     AS role_can_configure_trd,
         r.can_radicate_documents AS role_can_radicate_documents
       FROM users u
       JOIN roles r ON u.role_id = r.role_id
       WHERE u.user_id = $1 AND u.is_active = true`,
      [user_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const row = userResult.rows[0];

    // Traer overrides del usuario
    const overridesResult = await pool.query(
      `SELECT permission, granted FROM user_permissions WHERE user_id = $1`,
      [user_id]
    );

    const overrides = {};
    overridesResult.rows.forEach(({ permission, granted }) => {
      overrides[permission] = granted;
    });

    const resolve = (permKey, roleVal) =>
      overrides[permKey] !== undefined ? overrides[permKey] : roleVal;

    return res.json({
      id: row.user_id,
      full_name: row.full_name,
      email: row.email,
      role_id: row.role_id,
      role_name: row.role_name,
      entity_id: row.entity_id,
      permissions: {
        can_create_users:       resolve("can_create_users",       row.role_can_create_users),
        can_assign_roles:       resolve("can_assign_roles",       row.role_can_assign_roles),
        can_configure_trd:      resolve("can_configure_trd",      row.role_can_configure_trd),
        can_radicate_documents: resolve("can_radicate_documents", row.role_can_radicate_documents),
      },
      permissionsOrigin: {
        can_create_users:       overrides["can_create_users"]       !== undefined ? "custom" : "role",
        can_assign_roles:       overrides["can_assign_roles"]       !== undefined ? "custom" : "role",
        can_configure_trd:      overrides["can_configure_trd"]      !== undefined ? "custom" : "role",
        can_radicate_documents: overrides["can_radicate_documents"] !== undefined ? "custom" : "role",
      },
    });
  } catch (error) {
    console.error("getMe error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}