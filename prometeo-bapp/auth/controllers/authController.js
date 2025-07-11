const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: user.id, role_id: user.role_id },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, user: { id: user.id, email: user.email, full_name: user.full_name, role_id: user.role_id } });
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
};
