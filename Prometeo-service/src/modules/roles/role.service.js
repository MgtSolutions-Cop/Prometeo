import { pool } from "../../config/db.js";

//treaer todos los roles 
export const getAllRoles =async ()=>{

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
       SET name = $1,
           description = $2,
           can_create_users = $3,
           can_assign_roles = $4,
           can_configure_trd = $5,
           can_radicate_documents = $6
       WHERE role_id = $7
       RETURNING *`,
      [name, description, can_create_users, can_assign_roles, can_configure_trd, can_radicate_documents, id]
    );
  
    return result.rows[0];
  };

