import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../../config/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshsecret";

// ─────────────────────────────────────────────
// Genera el Access Token (vida corta: 15 min)
// Incluye role_id, entity_id y dependency_id
// para que el middleware pueda verificar permisos
// sin consultar la BD en cada petición
// ─────────────────────────────────────────────
export function generateAccessToken(user) {
  return jwt.sign(
    {
      user_id: user.user_id,
      role_id: user.role_id,
      entity_id: user.entity_id,
      dependency_id: user.dependency_id
    },
    JWT_SECRET,
    { expiresIn: "15m" }
  );
}

// ─────────────────────────────────────────────
// Genera el Refresh Token (vida larga: 7 días)
// Solo guarda el user_id para minimizar
// la información expuesta en la cookie
// ─────────────────────────────────────────────
export function generateRefreshToken(user) {
  return jwt.sign(
    { user_id: user.user_id },
    JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
}

// ─────────────────────────────────────────────
// Verifica y decodifica el Refresh Token
// Lanza error si está expirado o es inválido
// ─────────────────────────────────────────────
export function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}

// ─────────────────────────────────────────────
// Lógica principal de login:
// 1. Busca el usuario activo por email
// 2. Verifica la contraseña con bcrypt
// 3. Consulta los permisos del rol asignado
// 4. Devuelve tokens + datos del usuario + permisos
// ─────────────────────────────────────────────
export async function loginServices(email, password) {
  // Solo usuarios activos pueden iniciar sesión (soft delete)
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1 AND is_active = true",
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error("User not found or inactive");
  }

  const user = result.rows[0];

  // Comparamos la contraseña ingresada con el hash almacenado
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw new Error("Invalid Password");
  }

  // ─────────────────────────────────────────────
  // NUEVO: Consultamos los permisos del rol
  // del usuario para enviarlos al frontend.
  // El frontend los usará para filtrar el navbar
  // sin necesidad de hacer otra petición.
  // ─────────────────────────────────────────────
  const roleResult = await pool.query(
    "SELECT * FROM roles WHERE role_id = $1",
    [user.role_id]
  );

  // Si el rol no existe o está inactivo, bloqueamos el login
  const role = roleResult.rows[0];
  if (!role || !role.is_active) {
    throw new Error("Role not found or inactive");
  }

  // Generamos ambos tokens con los datos del usuario
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    accessToken,
    refreshToken,
    // ─────────────────────────────────────────────
    // Devolvemos todos los datos que el frontend
    // necesita guardar en localStorage:
    // - Datos básicos del usuario
    // - role_id para identificar el rol
    // - Objeto permissions con todos los permisos
    //   del rol (true/false por funcionalidad)
    // ─────────────────────────────────────────────
    user: {
      id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      role_id: user.role_id,          // ← NUEVO: necesario para el navbar
      entity_id: user.entity_id,
      // Mapeamos cada permiso booleano del rol
      // para que el frontend sepa qué mostrar
      permissions: {
        can_create_users: role.can_create_users,
        can_assign_roles: role.can_assign_roles,
        can_configure_trd: role.can_configure_trd,
        can_radicate_documents: role.can_radicate_documents,
      }
    },
  };
}