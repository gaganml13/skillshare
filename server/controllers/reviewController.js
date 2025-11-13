// Review controller: handles course reviews
const Review = require('../models/Review');
const Course = require('../models/Course');

/**
 * Create a review for a course
 */
exports.createReview = async (req, res) => {
  try {
    const { courseId, rating, comment } = req.body;
    // Prevent duplicate reviews by same user
    const existing = await Review.findOne({ course: courseId, user: req.user._id });
    if (existing) {
      return res.status(400).json({ message: 'You have already reviewed this course.' });
    }
    const review = new Review({ course: courseId, user: req.user._id, rating, comment });
    await review.save();
    // Add review to course
    await Course.findByIdAndUpdate(courseId, { $push: { reviews: review._id } });
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: 'Error creating review', error: err.message });
  }
};
