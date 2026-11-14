const Category = require('../models/Category');

const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message,
    });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch category',
      error: error.message,
    });
  }
};

const getMoviesByCategory = async (req, res) => {
  try {
    const movies = await Category.findMoviesByCategory(req.params.id);
    res.json({
      success: true,
      data: movies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch movies by category',
      error: error.message,
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  getMoviesByCategory,
};