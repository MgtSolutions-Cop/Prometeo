import { pool } from "../config/db.js";

/**
 * Middleware para verificar si el rol del usuario tiene un permiso específico.
 * @param {string} requiredPermission - El nombre de la columna booleana en la tabla 'roles'.
 */
export const requirePermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      // 1. Extraemos el role_id que dejó el authMiddleware
      const roleId = req.user?.role_id;

      if (!roleId) {
        return res.status(403).json({ message: "Acceso denegado. No se detectó un rol." });
      }

      // 2. Consultamos la base de datos para obtener los permisos actuales del rol
      const result = await pool.query("SELECT * FROM roles WHERE role_id = $1", [roleId]);

      if (result.rows.length === 0) {
        return res.status(403).json({ message: "Rol no encontrado en el sistema." });
      }

      const role = result.rows[0];

      // 3. Verificamos si la columna del permiso solicitado es 'true'
      if (role[requiredPermission] !== true) {
        return res.status(403).json({ 
          message: `Acceso denegado. Se requiere el permiso: ${requiredPermission}` 
        });
      }

      // 4. Si tiene el permiso, dejamos que la petición continúe hacia el controlador
      next();
    } catch (error) {
      console.error("Error en permissionMiddleware:", error);
      return res.status(500).json({ message: "Error interno verificando permisos." });
    }
  };
};