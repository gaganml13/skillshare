// ==============
// IMPORTS
// ==============
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cors = require('cors');
const path = require('path');

// Import Models and Middleware
const User = require('./models/User');
const Course = require('./models/Course');
const auth = require('./auth');
const upload = require('./upload');


// ==============
// INITIALIZATION
// ==============
const app = express();

app.use(cors({
  allowedHeaders: ['x-auth-token', 'Content-Type'],
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5001;


// ==============
// DATABASE CONNECTION & SERVER START
// ==============
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected successfully!');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB', err.message);
    process.exit(1);
  }
};
startServer();


// ==============
// API ROUTES
// ==============

// --- Auth Routes ---
app.get('/api/auth', auth, async (req, res) => { try { const user = await User.findById(req.user.id).select('-password'); res.json(user); } catch (err) { console.error(err.message); res.status(500).send('Server Error'); } });
app.post('/api/register', async (req, res) => { const { name, email, password, role } = req.body; try { let user = await User.findOne({ email }); if (user) { return res.status(400).json({ message: 'User already exists' }); } user = new User({ name, email, password, role }); const salt = await bcrypt.genSalt(10); user.password = await bcrypt.hash(password, salt); await user.save(); res.status(201).json({ message: 'User registered successfully' }); } catch (err) { console.error(err.message); res.status(500).send('Server Error'); } });
app.post('/api/login', async (req, res) => { const { email, password } = req.body; try { let user = await User.findOne({ email }); if (!user) { return res.status(400).json({ message: 'Invalid Credentials' }); } const isMatch = await bcrypt.compare(password, user.password); if (!isMatch) { return res.status(400).json({ message: 'Invalid Credentials' }); } const payload = { user: { id: user.id } }; jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => { if (err) throw err; res.json({ token }); }); } catch (err) { console.error(err.message); res.status(500).send('Server Error'); } });

// --- Course Routes ---
app.post('/api/courses', auth, async (req, res) => { const { title, description } = req.body; try { const newCourse = new Course({ title, description, user: req.user.id }); const course = await newCourse.save(); res.json(course); } catch (err) { console.error(err.message); res.status(500).send('Server Error'); } });
app.post('/api/courses/:id/videos', auth, async (req, res) => { const { title, url, videoType } = req.body; if (!title || !url || !videoType) { return res.status(400).json({ message: 'Please provide a title, url, and videoType' }); } try { const course = await Course.findById(req.params.id); if (!course) { return res.status(404).json({ message: 'Course not found' }); } if (course.user.toString() !== req.user.id) { return res.status(401).json({ message: 'User not authorized' }); } const newVideo = { title, url, videoType }; course.videos.unshift(newVideo); await course.save(); res.json(course.videos); } catch (err) { console.error(err.message); res.status(500).send('Server Error'); } });

// --- Get All Courses Route ---
app.get('/api/courses', async (req, res) => {
  try {
    // UPDATED: Now populates both name and _id
    const courses = await Course.find().sort({ date: -1 }).populate('user', ['name', '_id']);
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- Get a Single Course by ID Route ---
app.get('/api/courses/:id', async (req, res) => {
  try {
    // UPDATED: Now populates both name and _id
    const course = await Course.findById(req.params.id).populate('user', ['name', '_id']);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- Video Upload Route ---
app.post('/api/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.status(400).json({ message: err });
    } else {
      if (req.file == undefined) {
        res.status(400).json({ message: 'Error: No File Selected!' });
      } else {
        res.json({
          message: 'Video uploaded successfully!',
          filePath: `/uploads/${req.file.filename}`
        });
      }
    }
  });
});