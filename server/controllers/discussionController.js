// Discussion controller: handles Q&A for courses
const Discussion = require('../models/Discussion');

/**
 * Ask a question in a course discussion
 */
exports.askQuestion = async (req, res) => {
  try {
    const { courseId, question } = req.body;
    const discussion = new Discussion({ course: courseId, user: req.user._id, question });
    await discussion.save();
    res.status(201).json(discussion);
  } catch (err) {
    res.status(500).json({ message: 'Error asking question', error: err.message });
  }
};

/**
 * Answer a question in a course discussion
 */
exports.answerQuestion = async (req, res) => {
  try {
    const { discussionId, text } = req.body;
    const answer = { user: req.user._id, text, createdAt: new Date() };
    const discussion = await Discussion.findByIdAndUpdate(
      discussionId,
      { $push: { answers: answer } },
      { new: true }
    ).populate('answers.user', 'name');
    if (!discussion) return res.status(404).json({ message: 'Discussion not found' });
    res.json(discussion);
  } catch (err) {
    res.status(500).json({ message: 'Error answering question', error: err.message });
  }
};
