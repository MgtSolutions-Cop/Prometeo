import { pool } from "../../config/db.js";

export const getAllRoles = async () => {
    const result = await pool.query("SELECT * FROM roles ORDER BY role_id ASC");
    return result.rows;
};

export const getRoleById = async (id) => {
    const result = await pool.query("SELECT * FROM roles WHERE role_id = $1", [id]);
    return result.rows[0];
};

export const createRole = async (data) => {
    const {
        name,
        description,
        can_create_users = false,
        can_assign_roles = false,
        can_configure_trd = false,
        can_radicate_documents = false,
    } = data;

    const result = await pool.query(
        `INSERT INTO roles
        (name, description, can_create_users, can_assign_roles, can_configure_trd, can_radicate_documents)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [name, description, can_create_users, can_assign_roles, can_configure_trd, can_radicate_documents]
    );

    return result.rows[0];
};

export const updateRole = async (id, data) => {
    // Si no envían un campo, lo dejamos como undefined para que COALESCE actúe
    const {
        name,
        description,
        can_create_users,
        can_assign_roles,
        can_configure_trd,
        can_radicate_documents,
    } = data;

    const result = await pool.query(
        `UPDATE roles
        SET name = COALESCE($1, name),
            description = COALESCE($2, description),
            can_create_users = COALESCE($3, can_create_users),
            can_assign_roles = COALESCE($4, can_assign_roles),
            can_configure_trd = COALESCE($5, can_configure_trd),
            can_radicate_documents = COALESCE($6, can_radicate_documents)
        WHERE role_id = $7
        RETURNING *`,
        [name, description, can_create_users, can_assign_roles, can_configure_trd, can_radicate_documents, id]
    );

    // Es buena práctica lanzar un error si el rol no existía
    if (result.rows.length === 0) {
        throw new Error("Role not found");
    }

    return result.rows[0];
};
// src/services/role.service.js (o la ruta que manejes)

export const toggleRoleState = async (id) => {
    const result = await pool.query(
        `UPDATE roles
        SET is_active = NOT is_active
        WHERE role_id = $1
        RETURNING *`,
        [id]
    );

    if (result.rows.length === 0) {
        throw new Error("Role not found");
    }

    return result.rows[0];
};