import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../../config/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshsecret";

export function generateAccessToken(user) {
  return jwt.sign(
    {
      user_id: user.user_id,
      role_id: user.role_id,
      entity_id: user.entity_id,
      dependency_id: user.dependency_id,
    },
    JWT_SECRET,
    { expiresIn: "15m" }
  );
}

export function generateRefreshToken(user) {
  return jwt.sign({ user_id: user.user_id }, JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}

// ─────────────────────────────────────────────
// Resuelve los permisos efectivos del usuario:
// override de user_permissions > permiso del rol
// ─────────────────────────────────────────────
async function resolveEffectivePermissions(userId, roleId) {
  // Traer permisos del rol
  const roleResult = await pool.query(
    `SELECT can_create_users, can_assign_roles,
            can_configure_trd, can_radicate_documents
     FROM roles WHERE role_id = $1`,
    [roleId]
  );
  const role = roleResult.rows[0] ?? {};

  // Traer overrides del usuario
  const overridesResult = await pool.query(
    `SELECT permission, granted
     FROM user_permissions
     WHERE user_id = $1`,
    [userId]
  );

  const overrides = {};
  overridesResult.rows.forEach(({ permission, granted }) => {
    overrides[permission] = granted;
  });

  // Resolver: override tiene prioridad, si no hay → usar rol
  const resolve = (permKey) =>
    overrides[permKey] !== undefined ? overrides[permKey] : (role[permKey] ?? false);

  const permissions = {
    can_create_users:       resolve("can_create_users"),
    can_assign_roles:       resolve("can_assign_roles"),
    can_configure_trd:      resolve("can_configure_trd"),
    can_radicate_documents: resolve("can_radicate_documents"),
  };

  // Origen de cada permiso (para mostrar en UI)
  const permissionsOrigin = {
    can_create_users:       overrides["can_create_users"]       !== undefined ? "custom" : "role",
    can_assign_roles:       overrides["can_assign_roles"]       !== undefined ? "custom" : "role",
    can_configure_trd:      overrides["can_configure_trd"]      !== undefined ? "custom" : "role",
    can_radicate_documents: overrides["can_radicate_documents"] !== undefined ? "custom" : "role",
  };

  return { permissions, permissionsOrigin };
}

// ════════════════════════════════════════════════
// loginServices
// ════════════════════════════════════════════════
export async function loginServices(email, password) {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1 AND is_active = true",
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error("User not found or inactive");
  }

  const user = result.rows[0];

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw new Error("Invalid Password");
  }

  // Verificar que el rol esté activo
  const roleResult = await pool.query(
    "SELECT * FROM roles WHERE role_id = $1",
    [user.role_id]
  );
  const role = roleResult.rows[0];
  if (!role || !role.is_active) {
    throw new Error("Role not found or inactive");
  }

  const { permissions, permissionsOrigin } = await resolveEffectivePermissions(
    user.user_id,
    user.role_id
  );

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      role_id: user.role_id,
      entity_id: user.entity_id,
      permissions,
      permissionsOrigin,
    },
  };
}