const { pool } = require('../config/database');

const Favorite = {
  findByUser: async (userId) => {
    const [rows] = await pool.execute(
      `SELECT f.*, m.title, m.genre, m.rating, m.poster_url
       FROM favorites f
       JOIN movies m ON f.movie_id = m.id
       WHERE f.user_id = ?
       ORDER BY f.created_at DESC`,
      [userId]
    );
    return rows;
  },

  findByUserAndMovie: async (userId, movieId) => {
    const [rows] = await pool.execute(
      'SELECT * FROM favorites WHERE user_id = ? AND movie_id = ?',
      [userId, movieId]
    );
    return rows[0];
  },

  findById: async (id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM favorites WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  create: async (userId, movieId) => {
    const [result] = await pool.execute(
      'INSERT INTO favorites (user_id, movie_id) VALUES (?, ?)',
      [userId, movieId]
    );
    return result.insertId;
  },

  delete: async (userId, movieId) => {
    const [result] = await pool.execute(
      'DELETE FROM favorites WHERE user_id = ? AND movie_id = ?',
      [userId, movieId]
    );
    return result.affectedRows;
  },

  deleteById: async (id, userId) => {
    const [result] = await pool.execute(
      'DELETE FROM favorites WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows;
  },
};

module.exports = Favorite;