import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../../config/db.js";


const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refreshsecret";

// generar access token (vida corta)
export function generateAccessToken(user) {
  return jwt.sign(
    {
      user_id: user.user_id,
      role_id: user.role_id,
      entity_id: user.entity_id,
    },
    JWT_SECRET,
    { expiresIn: "15m" }
  );
}

// generar refresh token (vida larga)
export function generateRefreshToken(user) {
  return jwt.sign({ user_id: user.user_id }, JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
}

// verificar refresh token
export function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}


export async function loginServices(email,password) {
  //buscamos el user
  const result= await pool.query("SELECT * FROM users WHERE email = $1",[email]); 
  //verificamos que el usuario exista
  if (result.rows.length ===0 ){
    throw new Error("User not found");
  }
  const user=result.rows[0];
//verificamos contraseña
  const isValid =await bcrypt.compare(password, user.password_hash);
//si no es valido lazamos error
  if(!isValid){
    throw new Error("Invalid Password");
  }
  //generamos token y devolvemos 
  const token =jwt.sign(
    {
        user_id: user.user_id,
        role_id: user.role_id,
        entity_id: user.entity_id
    },
        process.env.JWT_SECRET,
        {expiresIn:"1h"}
  );

  return {
    token,
    user:{
        id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role_id: user.role_id,
    },
  };
}

