import { supabase } from '../config/db.js';

export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Acceso no autorizado' });

  try {
    // Verifica el token con Supabase
    const { user, error } = await supabase.auth.api.getUser(token);
    
    if (error) throw error;
    
    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Token inválido' });
  }
};