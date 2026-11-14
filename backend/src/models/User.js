const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = {
  findByEmail: async (email) => {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  },

  findById: async (id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  create: async (userData) => {
    const { name, email, password } = userData;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, userData.role || 'user']
    );
    return result.insertId;
  },

  update: async (id, userData) => {
    const fields = Object.keys(userData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(userData);
    values.push(id);

    const [result] = await pool.execute(
      `UPDATE users SET ${fields} WHERE id = ?`,
      values
    );
    return result.affectedRows;
  },

  delete: async (id) => {
    const [result] = await pool.execute(
      'DELETE FROM users WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  },
};

module.exports = User;