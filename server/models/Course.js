const mongoose = require('mongoose');
const Schema = mongoose.Schema; // This was the missing line

const CourseSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  videos: [
    {
      title: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      },
      videoType: {
        type: String,
        enum: ['upload', 'youtube'],
        required: true
      }
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('course', CourseSchema);