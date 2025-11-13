// Course routes: CRUD and details
const express = require('express');
const router = express.Router();

const { createCourse, getAllCourses, getCourseById, addLessonToCourse } = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');

// Create course (any authenticated user)
router.post('/', protect, createCourse);
// Get all courses
router.get('/', getAllCourses);
// Get courses for dashboard (created and enrolled)
router.get('/user/dashboard', protect, require('../controllers/courseController').getUserCourses);
// Get course by ID (with reviews/discussions)
router.get('/:id', getCourseById);

// Enroll in a course
router.post('/:id/enroll', protect, require('../controllers/courseController').enrollInCourse);
// Request access to private course
router.post('/:id/request-access', protect, require('../controllers/courseController').requestCourseAccess);
// Approve pending request (instructor only)
router.post('/:id/approve', protect, require('../controllers/courseController').approveRequest);

// Add lesson to course (any authenticated user)
router.put('/:id/lessons', protect, addLessonToCourse);

module.exports = router;
