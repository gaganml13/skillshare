const mongoose = require('mongoose'); // 1. Import Mongoose

// 2. Define the User Schema (the blueprint)
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // No two users can have the same email
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'instructor'],
    default: 'student',
  },
  date: {
    type: Date,
    default: Date.now, // Automatically sets the registration date
  },
});

// 3. Create and export the User model
module.exports = mongoose.model('user', UserSchema);