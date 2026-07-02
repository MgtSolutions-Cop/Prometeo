import { pool } from "../../config/db.js";

export async function getDependencies(entityId) {
  const result = await pool.query(
    `SELECT dependency_id, name, state, entity_id
     FROM dependencies
     WHERE entity_id = $1
     ORDER BY dependency_id ASC`,
    [entityId]
  );
  return result.rows;
}

export async function createDependency(name, entityId) {
  const existing = await pool.query(
    `SELECT dependency_id FROM dependencies WHERE name = $1 AND entity_id = $2`,
    [name, entityId]
  );
  if (existing.rows.length > 0) throw new Error("Ya existe una dependencia con ese nombre");

  const result = await pool.query(
    `INSERT INTO dependencies (name, state, entity_id)
     VALUES ($1, true, $2)
     RETURNING dependency_id, name, state, entity_id`,
    [name, entityId]
  );
  return result.rows[0];
}

export async function updateDependency(dependencyId, name, entityId) {
  const result = await pool.query(
    `UPDATE dependencies
     SET name = $1
     WHERE dependency_id = $2 AND entity_id = $3
     RETURNING dependency_id, name, state, entity_id`,
    [name, dependencyId, entityId]
  );
  if (result.rows.length === 0) throw new Error("Dependencia no encontrada");
  return result.rows[0];
}

export async function toggleDependencyState(dependencyId, entityId) {
  const result = await pool.query(
    `UPDATE dependencies
     SET state = NOT state
     WHERE dependency_id = $1 AND entity_id = $2
     RETURNING dependency_id, name, state, entity_id`,
    [dependencyId, entityId]
  );
  if (result.rows.length === 0) throw new Error("Dependencia no encontrada");
  return result.rows[0];
}

export async function deleteDependency(dependencyId, entityId) {
  // Verificar que no tenga usuarios o documentos asociados
  const usersCheck = await pool.query(
    `SELECT COUNT(*) FROM users WHERE dependency_id = $1`,
    [dependencyId]
  );
  if (parseInt(usersCheck.rows[0].count) > 0) {
    throw new Error("No se puede eliminar — hay usuarios asociados a esta dependencia");
  }

  const docsCheck = await pool.query(
    `SELECT COUNT(*) FROM documents WHERE dependency_id = $1`,
    [dependencyId]
  );
  if (parseInt(docsCheck.rows[0].count) > 0) {
    throw new Error("No se puede eliminar — hay documentos asociados a esta dependencia");
  }

  const result = await pool.query(
    `DELETE FROM dependencies
     WHERE dependency_id = $1 AND entity_id = $2
     RETURNING dependency_id`,
    [dependencyId, entityId]
  );
  if (result.rows.length === 0) throw new Error("Dependencia no encontrada");
  return { deleted: true, dependency_id: dependencyId };
}