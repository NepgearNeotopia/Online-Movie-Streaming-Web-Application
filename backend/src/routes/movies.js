const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { movieValidation } = require('../middleware/validation');
const movieController = require('../controllers/movieController');

router.get('/', movieController.getMovies);
router.get('/:id', movieController.getMovieById);
router.post('/', authenticate, requireAdmin, movieValidation, movieController.createMovie);
router.put('/:id', authenticate, requireAdmin, movieValidation, movieController.updateMovie);
router.delete('/:id', authenticate, requireAdmin, movieController.deleteMovie);

module.exports = router;