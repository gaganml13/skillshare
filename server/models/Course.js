const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user' // This links the course to the User model
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  // We will add more fields like videos, price, etc. later
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('course', CourseSchema);