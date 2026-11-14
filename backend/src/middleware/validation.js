const { body, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => e.msg),
    });
  }
  next();
};

const registerValidation = [
  body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required and must be under 100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidation,
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 1 }).withMessage('Password is required'),
  handleValidation,
];

const movieValidation = [
  body('title').trim().isLength({ min: 1, max: 255 }).withMessage('Title is required and must be under 255 characters'),
  body('description').optional().trim().isLength({ max: 2000 }).withMessage('Description must be under 2000 characters'),
  body('genre').optional().trim().isLength({ max: 100 }).withMessage('Genre must be under 100 characters'),
  body('duration').optional().isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
  body('release_year').optional().isInt({ min: 1900, max: 2099 }).withMessage('Release year must be between 1900 and 2099'),
  body('poster_url').optional().isURL().withMessage('Poster URL must be a valid URL'),
  body('rating').optional().isFloat({ min: 0, max: 10 }).withMessage('Rating must be between 0 and 10'),
  handleValidation,
];

module.exports = { registerValidation, loginValidation, movieValidation };