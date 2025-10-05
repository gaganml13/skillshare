// ==============
// IMPORTS
// ==============
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cors = require('cors');
const path = require('path'); // Node.js module for working with file paths

// Import Models, Middleware, and Upload config
const User = require('./models/User');
const Course = require('./models/Course');
const auth = require('./auth');
const upload = require('./upload'); // Import our new upload configuration


// ==============
// INITIALIZATION
// ==============
const app = express();

// CORS Configuration
app.use(cors({
  allowedHeaders: ['x-auth-token', 'Content-Type'],
}));

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the 'uploads' directory
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

// --- Test Route ---
app.get('/', (req, res) => {
  res.send('API is running...');
});

// --- Auth Routes ---
app.get('/api/auth', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.post('/api/register', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    user = new User({ name, email, password, role });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const payload = { user: { id: user.id } };
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
      if (err) {
        throw err;
      }
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- Course Routes ---
app.post('/api/courses', auth, async (req, res) => {
  const { title, description } = req.body;

  try {
    const newCourse = new Course({ title, description, user: req.user.id });
    const course = await newCourse.save();
    res.json(course);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find().sort({ date: -1 }).populate('user', ['name']);
    res.json(courses);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

app.get('/api/courses/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('user', ['name']);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- ADD A VIDEO TO A COURSE (Protected) ---
app.post('/api/courses/:id/videos', auth, async (req, res) => {
  // We now expect title, url, AND videoType
  const { title, url, videoType } = req.body;

  if (!title || !url || !videoType) {
    return res.status(400).json({ message: 'Please provide a title, url, and videoType' });
  }

  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const newVideo = { title, url, videoType };

    course.videos.unshift(newVideo);
    await course.save();

    res.json(course.videos);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- NEW VIDEO UPLOAD ROUTE ---
app.post('/api/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.status(400).json({ message: err });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: 'Error: No File Selected!' });
      return;
    }

    res.json({
      message: 'Video uploaded successfully!',
      // We send back the path to the file on our server
      filePath: `/uploads/${req.file.filename}`,
    });
  });
});