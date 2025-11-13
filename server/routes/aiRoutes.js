// AI routes: Gemini API relay
const express = require('express');
const router = express.Router();
const { generate } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

// Relay prompt to Gemini API
router.post('/generate', protect, generate);

module.exports = router;
