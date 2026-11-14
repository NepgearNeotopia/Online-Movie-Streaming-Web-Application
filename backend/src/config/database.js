require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10,
  queueLimit: 0,
  waitForConnections: true,
  multipleStatements: false,
});

const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return { success: true, message: 'MySQL connection successful' };
  } catch (error) {
    return { success: false, message: `MySQL connection failed: ${error.message}` };
  }
};

module.exports = { pool, testConnection };