require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool, testConnection } = require('./config/database');

const authRoutes = require('./routes/auth');
const moviesRoutes = require('./routes/movies');
const categoriesRoutes = require('./routes/categories');
const favoritesRoutes = require('./routes/favorites');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/db-health', async (req, res) => {
  const result = await testConnection();
  res.json({
    success: result.success,
    message: result.message,
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/movies', moviesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/favorites', favoritesRoutes);

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

const startServer = async () => {
  try {
    const dbTest = await testConnection();
    console.log(dbTest.success ? `✓ ${dbTest.message}` : `✗ ${dbTest.message}`);

    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`  - Health: http://localhost:${PORT}/api/health`);
      console.log(`  - DB Health: http://localhost:${PORT}/api/db-health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();