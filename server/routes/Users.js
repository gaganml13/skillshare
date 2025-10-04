const express = require('express');
const router = express.Router();

// 1. Import the User model we created
const User = require('../models/Users');

// 2. Create the registration route
// @route   POST api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  // For now, we'll just test if the route receives data
  try {
    console.log(req.body); // This will show the data from the frontend in our server's terminal
    res.send('Register route is working!');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 3. Export the router
module.exports = router;