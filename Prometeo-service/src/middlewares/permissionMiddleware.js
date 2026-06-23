import { pool } from "../config/db.js";

/**
 * Middleware para verificar permisos con jerarquía:
 *
 *   1. Override del usuario (tabla user_permissions)
 *      → si existe una fila, usa ese valor (true o false)
 *   2. Permiso del rol (tabla roles)
 *      → si no hay fila en user_permissions, hereda del rol
 *
 * Así el admin puede suspender o conceder funcionalidades
 * a un usuario individual sin tocar el rol global,
 * y agregar nuevos permisos no requiere migrar la BD.
 *
 * @param {string} requiredPermission - ej: 'can_radicate_documents'
 */
export const requirePermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.user_id;
      const roleId = req.user?.role_id;

      if (!userId || !roleId) {
        return res.status(403).json({
          message: "Acceso denegado. No se detectó usuario o rol.",
        });
      }

      // ── 1. Buscar override del usuario ────────────────────────────
      const overrideResult = await pool.query(
        `SELECT granted
         FROM user_permissions
         WHERE user_id = $1 AND permission = $2`,
        [userId, requiredPermission]
      );

      // Si existe un override → úsalo directamente
      if (overrideResult.rows.length > 0) {
        const granted = overrideResult.rows[0].granted;
        if (!granted) {
          return res.status(403).json({
            message: `Acceso denegado. El permiso "${requiredPermission}" está suspendido para este usuario.`,
          });
        }
        return next();
      }

      // ── 2. Sin override → verificar permiso del rol ───────────────
      const roleResult = await pool.query(
        `SELECT ${requiredPermission} AS granted
         FROM roles
         WHERE role_id = $1`,
        [roleId]
      );

      if (roleResult.rows.length === 0) {
        return res.status(403).json({ message: "Rol no encontrado." });
      }

      if (!roleResult.rows[0].granted) {
        return res.status(403).json({
          message: `Acceso denegado. Se requiere el permiso: ${requiredPermission}`,
        });
      }

      next();
    } catch (error) {
      console.error("Error en permissionMiddleware:", error);
      return res.status(500).json({ message: "Error interno verificando permisos." });
    }
  };
};