const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');

router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);
router.get('/:id/movies', categoryController.getMoviesByCategory);

module.exports = router;