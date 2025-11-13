// cloudinary.js - Configures and exports the Cloudinary instance
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;

/*
Code Description:
- Imports Cloudinary v2.
- Configures Cloudinary using environment variables from .env.
- Exports the configured Cloudinary instance for use in uploads.
*/
