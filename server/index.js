// ==============
// IMPORTS
// ==============
const jwt = require('jsonwebtoken');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('./models/User');

// ==============
// INITIALIZATION
// ==============
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

const PORT = process.env.PORT || 5001;

// ==============
// DATABASE CONNECTION & SERVER START
// ==============
const startServer = async () => {
  try {
    // Connect to the Database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected successfully!');

    // Start the Express server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

  } catch (err) {
    console.error('Failed to connect to MongoDB', err.message);
    process.exit(1);
  }
};

startServer(); // Call the main function to start everything

// ==============
// API ROUTES
// ==============

// --- Test Route ---
app.get('/', (req, res) => {
  res.send('API is running...');
});

// --- User Login Route (Updated with JWT) ---
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    // 1. Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // 2. Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    // === START OF NEW JWT LOGIC ===

    // 3. If credentials are correct, create the "payload" for our token
    const payload = {
      user: {
        id: user.id, // We only need the user's unique database ID in the token
      },
    };

    // 4. Sign the token with our secret key
    jwt.sign(
      payload,
      process.env.JWT_SECRET, // Fetches the secret key from our .env file
      { expiresIn: '5h' }, // This is optional, but makes the token expire in 5 hours
      (err, token) => {
        if (err) throw err;
        // 5. Send the token back to the client
        res.json({ token });
      }
    );

    // === END OF NEW JWT LOGIC ===

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});