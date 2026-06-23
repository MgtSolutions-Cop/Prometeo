import { pool } from "../../config/db.js";
import bcrypt from "bcrypt";

// ════════════════════════════════════════════════
// Permisos que el sistema conoce actualmente.
// Para agregar uno nuevo en el futuro, solo
// agrégalo aquí — no se necesita ALTER TABLE.
// ════════════════════════════════════════════════
export const KNOWN_PERMISSIONS = [
  "can_radicate_documents",
  "can_create_users",
  "can_assign_roles",
  "can_configure_trd",
];

// ─────────────────────────────────────────────
// Helper: obtiene los overrides de un usuario
// Devuelve un objeto { permiso: true/false/null }
// null = sin override (hereda del rol)
// ─────────────────────────────────────────────
async function getUserPermissionOverrides(userId) {
  const result = await pool.query(
    `SELECT permission, granted
     FROM user_permissions
     WHERE user_id = $1`,
    [userId]
  );

  const overrides = {};
  // Inicializar todos en null (heredar)
  KNOWN_PERMISSIONS.forEach((p) => (overrides[p] = null));
  // Rellenar con los que sí tienen override
  result.rows.forEach((row) => {
    overrides[row.permission] = row.granted;
  });

  return overrides;
}

// ─────────────────────────────────────────────
// Helper: guarda overrides de un usuario
// Recibe: { permiso: true | false | null }
// null = eliminar override (vuelve a heredar del rol)
// ─────────────────────────────────────────────
async function saveUserPermissionOverrides(client, userId, overrides) {
  for (const [permission, granted] of Object.entries(overrides)) {
    if (granted === null || granted === undefined) {
      // Sin override → eliminar fila si existe
      await client.query(
        `DELETE FROM user_permissions
         WHERE user_id = $1 AND permission = $2`,
        [userId, permission]
      );
    } else {
      // Con override → insertar o actualizar (upsert)
      await client.query(
        `INSERT INTO user_permissions (user_id, permission, granted, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (user_id, permission)
         DO UPDATE SET granted = EXCLUDED.granted, updated_at = NOW()`,
        [userId, permission, granted]
      );
    }
  }
}

// ════════════════════════════════════════════════
// createUser
// ════════════════════════════════════════════════
export const createUser = async (data, creatorEntityId) => {
  const { full_name, email, password, role_id, dependency_id } = data;

  const existing = await pool.query(
    "SELECT * FROM users WHERE LOWER(email) = LOWER($1)",
    [email]
  );
  if (existing.rows.length > 0) {
    throw new Error("User already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, role_id, dependency_id, entity_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING user_id, full_name, email, role_id, dependency_id, entity_id, is_active`,
    [full_name, email, passwordHash, role_id, dependency_id, creatorEntityId]
  );

  return { ...result.rows[0], permissionOverrides: {} };
};

// ════════════════════════════════════════════════
// getUsers — incluye overrides de cada usuario
// ════════════════════════════════════════════════
export const getUsers = async (entityId) => {
  const usersResult = await pool.query(
    `SELECT
       u.user_id, u.full_name, u.email, u.role_id,
       u.dependency_id, u.entity_id, u.is_active,
       r.name AS role_name
     FROM users u
     LEFT JOIN roles r ON u.role_id = r.role_id
     WHERE u.entity_id = $1
     ORDER BY u.user_id ASC`,
    [entityId]
  );

  // Traer todos los overrides de la entidad en una sola query
  const overridesResult = await pool.query(
    `SELECT up.user_id, up.permission, up.granted
     FROM user_permissions up
     JOIN users u ON up.user_id = u.user_id
     WHERE u.entity_id = $1`,
    [entityId]
  );

  // Agrupar overrides por user_id
  const overridesByUser = {};
  overridesResult.rows.forEach(({ user_id, permission, granted }) => {
    if (!overridesByUser[user_id]) {
      overridesByUser[user_id] = {};
      KNOWN_PERMISSIONS.forEach((p) => (overridesByUser[user_id][p] = null));
    }
    overridesByUser[user_id][permission] = granted;
  });

  return usersResult.rows.map((user) => ({
    ...user,
    permissionOverrides: overridesByUser[user.user_id] ?? buildNullOverrides(),
  }));
};

function buildNullOverrides() {
  const o = {};
  KNOWN_PERMISSIONS.forEach((p) => (o[p] = null));
  return o;
}

// ════════════════════════════════════════════════
// getUserId
// ════════════════════════════════════════════════
export const getUserId = async (id, entityId) => {
  const result = await pool.query(
    `SELECT
       u.user_id, u.full_name, u.email, u.role_id,
       u.dependency_id, u.entity_id, u.is_active,
       r.name AS role_name
     FROM users u
     LEFT JOIN roles r ON u.role_id = r.role_id
     WHERE u.user_id = $1 AND u.entity_id = $2`,
    [id, entityId]
  );

  if (!result.rows[0]) return null;

  const overrides = await getUserPermissionOverrides(id);
  return { ...result.rows[0], permissionOverrides: overrides };
};

// ════════════════════════════════════════════════
// updateUser — guarda datos + overrides de permisos
// ════════════════════════════════════════════════
export const updateUser = async (id, data, entityId) => {
  const { full_name, email, role_id, dependency_id, password, permissionOverrides } = data;

  let passwordHash = null;
  if (password) {
    passwordHash = await bcrypt.hash(password, 10);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Actualizar datos básicos del usuario
    const result = await client.query(
      `UPDATE users
       SET full_name     = COALESCE($1, full_name),
           email         = COALESCE($2, email),
           role_id       = COALESCE($3, role_id),
           dependency_id = COALESCE($4, dependency_id),
           password_hash = COALESCE($5, password_hash)
       WHERE user_id = $6 AND entity_id = $7
       RETURNING user_id, full_name, email, role_id, dependency_id, entity_id, is_active`,
      [full_name, email, role_id, dependency_id, passwordHash, id, entityId]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    // Guardar overrides de permisos si vienen en el payload
    if (permissionOverrides && typeof permissionOverrides === "object") {
      await saveUserPermissionOverrides(client, id, permissionOverrides);
    }

    await client.query("COMMIT");

    // Retornar con overrides actualizados
    const overrides = await getUserPermissionOverrides(id);
    return { ...result.rows[0], permissionOverrides: overrides };

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// ════════════════════════════════════════════════
// toggleUserState
// ════════════════════════════════════════════════
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