// ==============
// IMPORTS
// ==============
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cors = require('cors');

// Import Models and Middleware
const User = require('./models/User');
const Course = require('./models/Course');
const auth = require('./middleware/auth');


// ==============
// INITIALIZATION
// ==============
const app = express();

// This is the correct CORS configuration to allow custom headers
app.use(cors({
  allowedHeaders: ['x-auth-token', 'Content-Type'],
}));

// Middleware to parse JSON bodies
app.use(express.json());

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

// --- User Registration Route ---
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }
    user = new User({
      name,
      email,
      password,
    });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- User Login Route ---
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }
    const payload = {
      user: {
        id: user.id,
      },
    };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '5h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- Create a New Course Route (Protected) ---
app.post('/api/courses', auth, async (req, res) => {
  const { title, description } = req.body;
  try {
    const newCourse = new Course({
      title,
      description,
      user: req.user.id // Get user ID from auth middleware
    });

    const course = await newCourse.save();
    res.json(course);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});