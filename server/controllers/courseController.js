// Enroll in a course
exports.enrollInCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const userId = req.user._id.toString();
    if (course.authorizedUsers.map(u => u.toString()).includes(userId)) {
      return res.status(400).json({ message: 'Already enrolled' });
    }
    course.authorizedUsers.push(userId);
    await course.save();
    res.json({ message: 'Enrolled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Request access to a private course (adds to pendingRequests)
exports.requestCourseAccess = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const userId = req.user._id;
    if (course.pendingRequests.map(u => u.toString()).includes(String(userId))) {
      return res.status(400).json({ message: 'Already requested' });
    }
    course.pendingRequests.push(userId);
    await course.save();
    res.json({ message: 'Access requested' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve a pending request (instructor only)
exports.approveRequest = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (String(course.instructor) !== String(req.user._id)) return res.status(403).json({ message: 'Only instructor can approve' });
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId required' });
    // Remove from pending and add to authorized
    course.pendingRequests = (course.pendingRequests || []).filter(u => u.toString() !== String(userId));
    if (!course.authorizedUsers.map(u => u.toString()).includes(String(userId))) {
      course.authorizedUsers.push(userId);
    }
    await course.save();
    res.json({ message: 'User approved' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Get courses for dashboard (created and enrolled)
exports.getUserCourses = async (req, res) => {
  try {
    const userId = req.user._id;
    // Courses created by user
    const createdCourses = await Course.find({ instructor: userId })
      .populate('instructor', 'name')
      .select('-__v');
    // Courses user is authorized for (enrolled)
    const enrolledCourses = await Course.find({ authorizedUsers: userId })
      .populate('instructor', 'name')
      .select('-__v');
    res.json({ createdCourses, enrolledCourses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// courseController.js - Handles course CRUD and retrieval
const Course = require('../models/Course');
const Review = require('../models/Review');
const Discussion = require('../models/Discussion');
const User = require('../models/User');

// Add a lesson to a course
exports.addLessonToCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, videoUrl, visibility = 'enrolled', groupName, allowedUserEmails } = req.body;
    if (!title || !videoUrl) {
      return res.status(400).json({ message: 'Title and videoUrl are required.' });
    }
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    // Only instructor can add lessons
    if (String(course.instructor) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Only the instructor can add lessons.' });
    }
    const normalizedVisibility = ['public', 'enrolled', 'group'].includes(visibility) ? visibility : 'enrolled';
    let allowedUsers = [];
    if (normalizedVisibility === 'group') {
      const emails = Array.isArray(allowedUserEmails)
        ? allowedUserEmails
        : (typeof allowedUserEmails === 'string'
          ? allowedUserEmails.split(',').map(email => email.trim()).filter(Boolean)
          : []);
      if (emails.length === 0) {
        return res.status(400).json({ message: 'Specify at least one learner email for group access.' });
      }
      const users = await User.find({ email: { $in: emails } }).select('_id email');
      if (!users.length) {
        return res.status(400).json({ message: 'No matching learners found for the provided emails.' });
      }
      allowedUsers = users.map(u => u._id);
    }
    course.lessons.push({
      title,
      videoUrl,
      visibility: normalizedVisibility,
      groupName: normalizedVisibility === 'group' ? groupName || 'Private Group' : undefined,
      allowedUsers
    });
    await course.save();
    res.status(200).json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new course using uploaded thumbnail + lesson files
exports.createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      price,
      access = 'public',
      level = 'All levels',
      courseDuration,
      tags,
      lessons: lessonsPayload
    } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Title, description, and category are required.' });
    }

    const parseLessons = () => {
      if (!lessonsPayload) return [];
      if (Array.isArray(lessonsPayload)) return lessonsPayload;
      try {
        return JSON.parse(lessonsPayload);
      } catch (error) {
        console.info('createCourse: unable to parse lessons payload', error);
        return [];
      }
    };

    const normalizedAccess = ['public', 'community', 'private'].includes(access) ? access : 'public';
    const lessonFiles = Array.isArray(req.files?.lessonVideos) ? req.files.lessonVideos : [];
    const parsedLessons = parseLessons();

    const normalizedLessons = parsedLessons
      .map((lesson, index) => {
        const file = lessonFiles[index];
        const filePath = file ? `/uploads/${file.filename}` : lesson.videoUrl;
        const lessonTitle = (lesson?.title || '').trim();
        if (!lessonTitle || !filePath) return null;
        return {
          title: lessonTitle,
          description: (lesson?.description || '').trim(),
          duration: lesson?.duration || '10 min',
          order: index,
          videoUrl: filePath,
          visibility: ['public', 'enrolled', 'group'].includes(lesson?.visibility) ? lesson.visibility : 'enrolled'
        };
      })
      .filter(Boolean);

    if (normalizedLessons.length === 0) {
      return res.status(400).json({ message: 'Add at least one lesson with a video.' });
    }

    const thumbnailFile = req.files?.thumbnail?.[0];
    const thumbnailUrl = thumbnailFile ? `/uploads/${thumbnailFile.filename}` : (req.body.thumbnailUrl || '');

    const normalizedTags = Array.isArray(tags)
      ? tags
      : (typeof tags === 'string'
        ? tags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : []);

    const totalDuration = courseDuration || `${Math.max(normalizedLessons.length * 10, 10)} min`;

    const course = await Course.create({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      level: level || 'All levels',
      thumbnailUrl,
      duration: totalDuration,
      price: Number(price) || 0,
      access: normalizedAccess,
      lessons: normalizedLessons,
      tags: normalizedTags,
      instructor: req.user._id
    });

    res.status(201).json(course);
  } catch (err) {
    console.error('createCourse error', err);
    res.status(400).json({ message: err.message || 'Unable to create course' });
  }
};

// Get all public/community courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ access: { $in: ['public', 'community'] } })
      .populate('instructor', 'name')
      .select('-__v');
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a course by ID (with access check, reviews, and discussions)
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name')
      .populate({ path: 'reviews', populate: { path: 'user', select: 'name' } });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // If private, only instructor or authorized users can access
    if (course.access === 'private') {
      const userId = req.user?._id?.toString();
      const isAuthorized = userId && (userId === course.instructor.toString() || (course.authorizedUsers || []).map(u => u.toString()).includes(userId));
      if (!isAuthorized) {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    // Populate discussions
    const discussions = await Discussion.find({ course: course._id })
      .populate('user', 'name')
      .populate('answers.user', 'name');

    res.json({ ...course.toObject(), discussions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
