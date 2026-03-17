import { pool } from "../../config/db.js";
import bcrypt from "bcrypt";

export const createUser = async (data, creatorEntityId) => {
    // Tomamos el entity_id del creador por seguridad, ignorando si mandan otro en el body
    const { full_name, email, password, role_id, dependency_id } = data;

    const existing = await pool.query("SELECT * FROM users WHERE LOWER(email) = LOWER($1)", [email]);
    if (existing.rows.length > 0) {
        throw new Error("User already exists");
    }

    let passwordHash;
    try {
        passwordHash = await bcrypt.hash(password, 10);
    } catch (error) {
        throw new Error("Error hashing the password");
    }

    const result = await pool.query(
        `INSERT INTO users (full_name, email, password_hash, role_id, dependency_id, entity_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING user_id, full_name, email, role_id, dependency_id, entity_id, is_active`,
        [full_name, email, passwordHash, role_id, dependency_id, creatorEntityId]
    );

    return result.rows[0];
};

export const getUsers = async (entityId) => {
    const result = await pool.query(
      "SELECT user_id, full_name, email, role_id, dependency_id, entity_id, is_active FROM users WHERE entity_id = $1",
      [entityId]
    );
    return result.rows;
};

export const getUserId = async (id, entityId) => {
    const result = await pool.query(
      "SELECT user_id, full_name, email, role_id, dependency_id, entity_id, is_active FROM users WHERE user_id=$1 AND entity_id=$2",
      [id, entityId]
    );
    return result.rows[0];
};

export const updateUser = async (id, data, entityId) => {
    // Ahora extraemos también el password que nos llega del frontend
    const { full_name, email, role_id, dependency_id, password } = data;
    
    // Si viene una contraseña nueva, la encriptamos. Si no, la dejamos nula.
    let passwordHash = null;
    if (password) {
        passwordHash = await bcrypt.hash(password, 10);
    }
    
    // Uso de COALESCE: Si passwordHash es null, mantiene el password_hash que ya estaba en la BD
    const result = await pool.query(
        `UPDATE users
        SET full_name = COALESCE($1, full_name), 
            email = COALESCE($2, email), 
            role_id = COALESCE($3, role_id), 
            dependency_id = COALESCE($4, dependency_id),
            password_hash = COALESCE($5, password_hash)
        WHERE user_id = $6 AND entity_id = $7
        RETURNING user_id, full_name, email, role_id, dependency_id, entity_id, is_active`,
       [full_name, email, role_id, dependency_id, passwordHash, id, entityId]
     );

     // Si no encontró el usuario
     if (result.rows.length === 0) {
         return null;
     }

     return result.rows[0];
};

export const toggleUserState = async (id, entityId) => {
    const result = await pool.query(
        `UPDATE users
        SET is_active = NOT is_active
        WHERE user_id = $1 AND entity_id = $2
        RETURNING user_id, full_name, email, is_active`,
       [id, entityId]
    );
    return result.rows[0]; 
};