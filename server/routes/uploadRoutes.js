// uploadRoutes.js - Route for handling file uploads to Cloudinary
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const { uploadFile } = require('../controllers/uploadController');

// Configure multer-storage-cloudinary for video uploads
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'skillshare_videos', // Cloudinary folder
    resource_type: 'video', // Specify video uploads
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv'],
  },
});

const upload = multer({ storage });

// POST /api/upload - Upload a video file
router.post('/', upload.single('file'), uploadFile);

module.exports = router;

/*
Code Description:
- Sets up multer with Cloudinary storage for video uploads.
- POST /api/upload expects a file in the 'file' field.
- Calls uploadController.uploadFile to return Cloudinary URL and public ID.
*/
