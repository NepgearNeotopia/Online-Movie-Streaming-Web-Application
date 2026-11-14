const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const favoriteController = require('../controllers/favoriteController');

router.use(authenticate);
router.get('/', favoriteController.getFavorites);
router.post('/', favoriteController.addFavorite);
router.delete('/id/:id', favoriteController.removeFavoriteById);
router.delete('/:movie_id', favoriteController.removeFavorite);

module.exports = router;