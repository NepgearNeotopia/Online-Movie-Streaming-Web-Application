const Movie = require('../models/Movie');

const getMovies = async (req, res) => {
  try {
    const filters = {
      genre: req.query.genre,
      search: req.query.search,
      min_rating: req.query.min_rating,
    };

    const movies = await Movie.findAll(filters);
    res.json({
      success: true,
      data: movies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch movies',
      error: error.message,
    });
  }
};

const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    res.json({
      success: true,
      data: movie,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch movie',
      error: error.message,
    });
  }
};

const createMovie = async (req, res) => {
  try {
    const { title, description, genre, duration, release_year, poster_url, rating, video_url } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
      });
    }

    const movieId = await Movie.create({
      title,
      description,
      genre,
      duration,
      release_year,
      poster_url,
      rating,
      video_url,
    });

    res.status(201).json({
      success: true,
      message: 'Movie created successfully',
      data: { id: movieId },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create movie',
      error: error.message,
    });
  }
};

const updateMovie = async (req, res) => {
  try {
    const affected = await Movie.update(req.params.id, req.body);
    if (affected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    res.json({
      success: true,
      message: 'Movie updated successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update movie',
      error: error.message,
    });
  }
};

const deleteMovie = async (req, res) => {
  try {
    const affected = await Movie.delete(req.params.id);
    if (affected === 0) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found',
      });
    }

    res.json({
      success: true,
      message: 'Movie deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete movie',
      error: error.message,
    });
  }
};

module.exports = {
  getMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie,
};