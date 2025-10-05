const multer = require('multer');
const path = require('path');

// Set up the storage engine for multer
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function(req, file, cb) {
    // Create a unique filename: fieldname-timestamp.extension
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Initialize the upload variable
const upload = multer({
  storage: storage,
  limits: { fileSize: 200000000 }, // Set a file size limit (e.g., 200MB)
  fileFilter: function(req, file, cb) {
    checkFileType(file, cb);
  }
}).single('video'); // This expects an input field with the name 'video'

// Function to check if the uploaded file is a video
function checkFileType(file, cb) {
  // Allowed extensions
  const filetypes = /mp4|mov|avi|mkv|wmv/;
  // Check the file extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check the mime type
  const mimetype = file.mimetype.startsWith('video/');

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: You can only upload video files!');
  }
}

module.exports = upload;