import * as roleService from "./role.service.js";

// Listar todos los roles
export const getRoles = async (req, res) => {
  try {
    const roles = await roleService.getAllRoles();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Ver un rol por ID
export const getRoleById = async (req, res) => {
  try {
    const role = await roleService.getRoleById(req.params.id);
    if (!role) return res.status(404).json({ message: "Role not found" });
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear nuevo rol
export const createRole = async (req, res) => {
  try {
    const newRole = await roleService.createRole(req.body);
    res.status(201).json(newRole);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Actualizar rol
export const updateRole = async (req, res) => {
  try {
    const updated = await roleService.updateRole(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

