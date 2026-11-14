const { pool } = require('../config/database');

const QUERY_TIMEOUT = 10000;

const executeWithTimeout = async (connection, sql, values) => {
  return Promise.race([
    connection.execute(sql, values),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Query timeout')), QUERY_TIMEOUT)
    ),
  ]);
};

const Movie = {
  findAll: async (filters = {}) => {
    let query = 'SELECT * FROM movies WHERE 1=1';
    const params = [];

    if (filters.genre) {
      query += ' AND genre = ?';
      params.push(filters.genre);
    }

    if (filters.search) {
      query += ' AND (title LIKE ? OR description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (filters.min_rating) {
      query += ' AND rating >= ?';
      params.push(filters.min_rating);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  },

  findById: async (id) => {
    const [rows] = await pool.execute(
      'SELECT * FROM movies WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  findByGenre: async (genre) => {
    const [rows] = await pool.execute(
      'SELECT * FROM movies WHERE genre = ? ORDER BY created_at DESC',
      [genre]
    );
    return rows;
  },

  search: async (query) => {
    const [rows] = await pool.execute(
      'SELECT * FROM movies WHERE title LIKE ? OR description LIKE ? ORDER BY created_at DESC',
      [`%${query}%`, `%${query}%`]
    );
    return rows;
  },

  create: async (movieData) => {
    const { title, description, genre, duration, release_year, poster_url, rating, video_url } = movieData;
    const [result] = await pool.execute(
      'INSERT INTO movies (title, description, genre, duration, release_year, poster_url, rating, video_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description ?? null, genre ?? null, duration ?? null, release_year ?? null, poster_url ?? null, rating ?? null, video_url ?? null]
    );
    return result.insertId;
  },

  update: async (id, movieData) => {
    const sanitized = {};
    for (const key of Object.keys(movieData)) {
      sanitized[key] = movieData[key] ?? null;
    }
    const fields = Object.keys(sanitized).map(key => `${key} = ?`).join(', ');
    const values = Object.values(sanitized);
    values.push(id);

    const connection = await pool.getConnection();
    let destroyed = false;
    try {
      const [result] = await executeWithTimeout(
        connection,
        `UPDATE movies SET ${fields} WHERE id = ?`,
        values
      );
      return result.affectedRows;
    } catch (error) {
      destroyed = true;
      connection.destroy();
      throw error;
    } finally {
      if (!destroyed) connection.release();
    }
  },

  delete: async (id) => {
    const connection = await pool.getConnection();
    let destroyed = false;
    try {
      const [result] = await executeWithTimeout(
        connection,
        'DELETE FROM movies WHERE id = ?',
        [id]
      );
      return result.affectedRows;
    } catch (error) {
      destroyed = true;
      connection.destroy();
      throw error;
    } finally {
      if (!destroyed) connection.release();
    }
  },
};

module.exports = Movie;