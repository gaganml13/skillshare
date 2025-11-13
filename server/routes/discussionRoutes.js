// Discussion routes: ask/answer questions
const express = require('express');
const router = express.Router();
const { askQuestion, answerQuestion } = require('../controllers/discussionController');
const { protect } = require('../middleware/authMiddleware');

// Ask a question
router.post('/ask', protect, askQuestion);
// Answer a question
router.post('/answer', protect, answerQuestion);

module.exports = router;
