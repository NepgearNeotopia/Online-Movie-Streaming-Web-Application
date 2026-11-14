const mysql = require('mysql2/promise');
require('dotenv').config();

const createTables = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('user', 'admin') DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const createMoviesTable = `
    CREATE TABLE IF NOT EXISTS movies (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      genre VARCHAR(100),
      duration INT,
      release_year INT,
      poster_url VARCHAR(500),
      rating DECIMAL(3,1),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const createCategoriesTable = `
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const createMovieCategoriesTable = `
    CREATE TABLE IF NOT EXISTS movie_categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      movie_id INT NOT NULL,
      category_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE,
      UNIQUE KEY unique_movie_category (movie_id, category_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const createFavoritesTable = `
    CREATE TABLE IF NOT EXISTS favorites (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      movie_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
      UNIQUE KEY unique_user_movie (user_id, movie_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  await connection.query(createUsersTable);
  console.log('✓ users table created');

  await connection.query(createMoviesTable);
  console.log('✓ movies table created');

  await connection.query(createCategoriesTable);
  console.log('✓ categories table created');

  await connection.query(createMovieCategoriesTable);
  console.log('✓ movie_categories table created');

  await connection.query(createFavoritesTable);
  console.log('✓ favorites table created');

  await connection.end();
  console.log('All tables created successfully');
};

createTables().catch((err) => {
  console.error('Error creating tables:', err.message);
  process.exit(1);
});