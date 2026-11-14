const Favorite = require('../models/Favorite');

const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.findByUser(req.user.id);
    res.json({
      success: true,
      data: favorites,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch favorites',
      error: error.message,
    });
  }
};

const addFavorite = async (req, res) => {
  try {
    const { movie_id } = req.body;

    if (!movie_id) {
      return res.status(400).json({
        success: false,
        message: 'movie_id is required',
      });
    }

    const existing = await Favorite.findByUserAndMovie(req.user.id, movie_id);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Movie already in favorites',
      });
    }

    const favoriteId = await Favorite.create(req.user.id, movie_id);
    res.status(201).json({
      success: true,
      message: 'Movie added to favorites',
      data: { id: favoriteId },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add favorite',
      error: error.message,
    });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const { movie_id } = req.params;

    const affected = await Favorite.delete(req.user.id, movie_id);
    if (affected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found',
      });
    }

    res.json({
      success: true,
      message: 'Movie removed from favorites',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove favorite',
      error: error.message,
    });
  }
};

const removeFavoriteById = async (req, res) => {
  try {
    const favorite = await Favorite.findById(req.params.id);
    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found',
      });
    }

    if (Number(favorite.user_id) !== Number(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only remove your own favorites.',
      });
    }

    const affected = await Favorite.deleteById(req.params.id, req.user.id);
    if (affected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found',
      });
    }

    res.json({
      success: true,
      message: 'Favorite removed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove favorite',
      error: error.message,
    });
  }
};

module.exports = {
  getFavorites,
  addFavorite,
  removeFavorite,
  removeFavoriteById,
};