// uploadController.js - Handles file upload and returns Cloudinary URL & public ID
exports.uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  // File uploaded to Cloudinary by multer-storage-cloudinary
  const { path, filename } = req.file;
  res.json({
    url: path, // Secure URL from Cloudinary
    public_id: filename, // Public ID from Cloudinary
  });
};

/*
Code Description:
- Checks if a file was uploaded.
- Returns the secure URL and public ID from Cloudinary (provided by multer-storage-cloudinary).
*/
