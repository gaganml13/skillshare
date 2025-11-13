// Review routes: create review
const express = require('express');
const router = express.Router();
const { createReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Create review for a course
router.post('/', protect, createReview);

module.exports = router;
