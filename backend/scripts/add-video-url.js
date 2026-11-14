const { pool } = require('../src/config/database');

const addVideoUrlColumn = async () => {
  try {
    const [columns] = await pool.execute("SHOW COLUMNS FROM movies LIKE 'video_url'");
    if (columns.length > 0) {
      console.log('✓ video_url column already exists');
      await pool.end();
      return;
    }

    await pool.execute(
      "ALTER TABLE movies ADD COLUMN video_url VARCHAR(1000) NULL AFTER poster_url"
    );
    console.log('✓ video_url column added to movies table');
  } catch (error) {
    console.error('Error adding video_url column:', error.message);
  }
  await pool.end();
};

addVideoUrlColumn();