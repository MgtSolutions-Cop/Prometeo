import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../../config/db.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshsecret";

// Generar access token (vida corta)
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

// Generar refresh token (vida larga)
export function generateRefreshToken(user) {
  return jwt.sign({ user_id: user.user_id }, JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
}

// Verificar refresh token
export function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}

export async function loginServices(email, password) {
  // Regla de Prometeo: Solo permitimos login a usuarios activos (Soft Delete)
  const result = await pool.query("SELECT * FROM users WHERE email = $1 AND is_active = true", [email]); 
  
  if (result.rows.length === 0) {
    throw new Error("User not found or inactive");
  }
  
  const user = result.rows[0];
  const isValid = await bcrypt.compare(password, user.password_hash);
  
  if (!isValid) {
    throw new Error("Invalid Password");
  }
  
  // Usamos las funciones de arriba para generar AMBOS tokens
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
    },
  };
}