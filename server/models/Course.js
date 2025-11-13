const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  visibility: { type: String, enum: ['public', 'enrolled', 'group'], default: 'enrolled' },
  groupName: { type: String },
  allowedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  access: { type: String, enum: ['public', 'private'], default: 'public' },
  authorizedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  pendingRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lessons: [lessonSchema]
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
