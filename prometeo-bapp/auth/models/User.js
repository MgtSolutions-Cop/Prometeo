import { supabase } from '../config/db.js';

export class User {
  static async create({ email, password, role_id }) {
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, password, role_id }]);
    
    if (error) throw error;
    return data;
  }

  static async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    return data;
  }
}