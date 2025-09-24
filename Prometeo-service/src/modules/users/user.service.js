import {pool} from "../../config/db.js";
import bcrypt from "bcrypt";

export const createUser = async (data) => {
    const { full_name, email, password, role_id, dependency_id, entity_id } = data;

    // Verificar si el usuario ya existe
    const existing = await pool.query("SELECT * FROM users WHERE LOWER(email) = LOWER($1)", [email]);
    if (existing.rows.length > 0) {
        throw new Error("User already exists");
    }

    // Hash de la contraseña
    let passwordHash;
    try {
        passwordHash = await bcrypt.hash(password, 10);
    } catch (error) {
        throw new Error("Error hashing the password");
    }

    // Insertar nuevo usuario en la base de datos
    const result = await pool.query(
        `INSERT INTO users (full_name, email, password_hash, role_id, dependency_id, entity_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING user_id, full_name, email, role_id, dependency_id, entity_id, is_active`,
        [full_name, email, passwordHash, role_id, dependency_id, entity_id]
    );

    return result.rows[0];
};

//traer los usuarios(todos)
export const getUsers = async () => {
    const result = await pool.query(
      "SELECT user_id, full_name, email, role_id, dependency_id, entity_id, is_active FROM users"
    );
    return result.rows;
  };
//traer user por id
export const getUserId =async (id)=>{
const result = await pool.query(
    "SELECT user_id, full_name, email, role_id, dependency_id, entity_id, is_active FROM users WHERE user_id=$1",
    [id]
  );
  return result.rows[0];
};
//editar usuario
export const updateUser = async (id,data)=>{
const {full_name,email,role_id,dependency_id} =data;
    const result = await pool.query(
        `UPDATE users
        SET full_name=$1, email=$2, role_id=$3, dependency_id=$4
        WHERE user_id=$5
        RETURNING user_id, full_name, email, role_id, dependency_id, entity_id, is_active`,
       [full_name, email, role_id, dependency_id, id]
     );
     return result.rows[0];
};
//activar o desactivar user
export const toggleUserState = async (id)=>{
const result = await pool.query(
    `UPDATE users
    SET is_active = NOT is_active
    WHERE user_id=$1
    RETURNING user_id, full_name, email, is_active`,
   [id]
);
return result.rows[0]; 
};  