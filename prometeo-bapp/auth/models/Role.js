import { supabase } from '../config/db.js';

export class Role {
  static async getAll() {
    const { data, error } = await supabase
      .from('roles')
      .select('*');
    
    if (error) throw error;
    return data;
  }

  static async create({ name, permissions }) {
    const { data, error } = await supabase
      .from('roles')
      .insert([{ name, permissions }]);
    
    return data;
  }
}