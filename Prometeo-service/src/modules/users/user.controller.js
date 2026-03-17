import * as userServices from "./user.service.js"; // Ajusté la ruta de importación por si acaso

export const createUser = async(req, res) => {
    try {
        // Pasamos el body y el entity_id del usuario creador para asegurar que el nuevo usuario nazca en la misma entidad
        const newUser = await userServices.createUser(req.body, req.user.entity_id);
        res.status(201).json(newUser);
    } catch(error) {
        res.status(400).json({message: error.message});
    }
};

export const getUsers = async (req, res) => {
    try {
      // Pasamos el entity_id para filtrar
      const users = await userServices.getUsers(req.user.entity_id);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};

export const getUserId = async(req, res) => {
    try {
        const user = await userServices.getUserId(req.params.id, req.user.entity_id);
        if (!user) return res.status(404).json({message: "User not found or belongs to another entity"});
        res.json(user);
    } catch(error) {
        res.status(500).json({message: error.message});
    }
};

export const updateUser = async (req, res) => {
    try {
        const update = await userServices.updateUser(req.params.id, req.body, req.user.entity_id);
        if (!update) return res.status(404).json({message: "User not found"});
        res.json(update);
    } catch(error) {
        res.status(400).json({message: error.message});
    }
};

export const toggleUserState = async(req, res) => {
    try {
        const toggled = await userServices.toggleUserState(req.params.id, req.user.entity_id);
        if (!toggled) return res.status(404).json({message: "User not found"});
        res.json(toggled);
    } catch(error) {
        res.status(400).json({message: error.message});
    }
};