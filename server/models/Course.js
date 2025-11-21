const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  duration: { type: String, default: '10 min' },
  videoUrl: { type: String, required: true },
  order: { type: Number, default: 0 },
  visibility: { type: String, enum: ['public', 'enrolled', 'group'], default: 'enrolled' },
  groupName: { type: String },
  allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  level: { type: String, default: 'All levels' },
  duration: { type: String, default: '' },
  thumbnailUrl: { type: String, default: '' },
  price: { type: Number, required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  access: { type: String, enum: ['public', 'community', 'private'], default: 'public' },
  tags: [{ type: String }],
  authorizedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lessons: [lessonSchema]
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
