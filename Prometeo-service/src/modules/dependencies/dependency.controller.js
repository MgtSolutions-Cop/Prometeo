import {
  getDependencies,
  createDependency,
  updateDependency,
  toggleDependencyState,
  deleteDependency,
} from "./dependency.service.js";

export async function getDependenciesController(req, res) {
  try {
    const deps = await getDependencies(req.user.entity_id);
    return res.json(deps);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

export async function createDependencyController(req, res) {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "El nombre es requerido" });
    const dep = await createDependency(name.trim(), req.user.entity_id);
    return res.status(201).json(dep);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

export async function updateDependencyController(req, res) {
  try {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "El nombre es requerido" });
    const dep = await updateDependency(req.params.id, name.trim(), req.user.entity_id);
    return res.json(dep);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

export async function toggleDependencyController(req, res) {
  try {
    const dep = await toggleDependencyState(req.params.id, req.user.entity_id);
    return res.json(dep);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}

export async function deleteDependencyController(req, res) {
  try {
    const result = await deleteDependency(req.params.id, req.user.entity_id);
    return res.json(result);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
}