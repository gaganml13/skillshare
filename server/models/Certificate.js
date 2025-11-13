// Certificate model for issued certificates
const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  issueDate: {
    type: Date,
    default: Date.now,
  },
  certificateId: {
    type: String,
    unique: true,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Certificate', CertificateSchema);
