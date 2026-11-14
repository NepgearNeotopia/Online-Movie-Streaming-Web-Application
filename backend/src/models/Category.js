const { pool } = require('../config/database');

const Category = {
  findAll: async () => {
    const [rows] = await pool.execute(
      'SELECT * FROM categories ORDER BY name ASC'
    );
    return rows;
  },

  findById: async (id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  findMoviesByCategory: async (categoryId) => {
    const [rows] = await pool.execute(
      `SELECT m.*
       FROM movies m
       JOIN movie_categories mc ON m.id = mc.movie_id
       WHERE mc.category_id = ?
       ORDER BY m.created_at DESC`,
      [categoryId]
    );
    return rows;
  },
};

module.exports = Category;