const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

(async () => {
  const pool = mysql.createPool({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'test_movie_streaming',
    connectionLimit: 5,
  });

  const results = [];

  // CREATE test user
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('test123', salt);
  const [userResult] = await pool.execute(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    ['Test User', 'test@test.com', hash, 'user']
  );
  const testUserId = userResult.insertId;
  results.push({ step: 'CREATE user', id: testUserId, pass: true });

  // CREATE movie
  const [movieResult] = await pool.execute(
    'INSERT INTO movies (title, description, genre, duration, release_year, poster_url, video_url, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    ['Test Movie', 'A test movie', 'Action', 120, 2024, 'http://example.com/poster.jpg', 'http://example.com/video.mp4', 8.5]
  );
  const testMovieId = movieResult.insertId;
  results.push({ step: 'CREATE movie', id: testMovieId, pass: true });

  // READ movie
  const [readRows] = await pool.execute('SELECT * FROM movies WHERE id = ?', [testMovieId]);
  const readMovie = readRows[0];
  const readOk = readMovie && readMovie.title === 'Test Movie' && readMovie.genre === 'Action';
  results.push({ step: 'READ movie', id: testMovieId, pass: readOk, data: { title: readMovie?.title, genre: readMovie?.genre } });

  // UPDATE movie
  const [updateResult] = await pool.execute(
    'UPDATE movies SET title = ?, genre = ?, rating = ? WHERE id = ?',
    ['Updated Test', 'Comedy', 7.5, testMovieId]
  );
  const [updatedRows] = await pool.execute('SELECT * FROM movies WHERE id = ?', [testMovieId]);
  const updateOk = updatedRows[0]?.title === 'Updated Test' && updatedRows[0]?.genre === 'Comedy';
  results.push({ step: 'UPDATE movie', id: testMovieId, pass: updateOk, data: { title: updatedRows[0]?.title, genre: updatedRows[0]?.genre, rating: updatedRows[0]?.rating } });

  // DELETE movie
  const [deleteResult] = await pool.execute('DELETE FROM movies WHERE id = ?', [testMovieId]);
  const [afterDelete] = await pool.execute('SELECT * FROM movies WHERE id = ?', [testMovieId]);
  const deleteOk = deleteResult.affectedRows === 1 && afterDelete.length === 0;
  results.push({ step: 'DELETE movie', id: testMovieId, pass: deleteOk });

  // Cleanup test user
  await pool.execute('DELETE FROM users WHERE id = ?', [testUserId]);

  // Print results
  console.log('\n=== CRUD TEST RESULTS (test_movie_streaming) ===');
  let allPass = true;
  results.forEach(r => {
    const status = r.pass ? 'PASS' : 'FAIL';
    if (!r.pass) allPass = false;
    console.log(`${status}: ${r.step} (id=${r.id})${r.data ? ' - ' + JSON.stringify(r.data) : ''}`);
  });
  console.log(`\nOverall: ${allPass ? 'ALL PASS' : 'SOME FAILED'}`);

  await pool.end();
})();