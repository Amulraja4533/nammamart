const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Define the absolute path to the uploads directory.
 * This ensures that Multer saves files in the correct location 
 * regardless of where the server is started from.
 * Since this file is in backend/routes/, '../uploads' points to backend/uploads.
 */
const uploadDir = path.resolve(__dirname, '..', 'uploads');

/**
 * Ensure the upload directory exists at module load time.
 * If it doesn't exist, create it recursively.
 */
if (!fs.existsSync(uploadDir)) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Created upload directory at: ${uploadDir}`);
  } catch (err) {
    console.error('CRITICAL: Failed to create uploads directory:', err.message);
  }
}

/**
 * Configure Multer Storage Engine
 */
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    // Generate a unique filename: fieldname-timestamp.extension
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

/**
 * Validates file type and extension
 * Allowed: jpg, jpeg, png
 */
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    // Return an Error object instead of a string to prevent 500 errors 
    // and ensure compatibility with Express error handlers.
    cb(new Error('Images only! Only .jpg, .jpeg, and .png files are accepted.'));
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

/**
 * @desc    Upload product image
 * @route   POST /api/upload
 * @access  Private/Admin
 */
router.post('/', protect, admin, (req, res) => {
  /**
   * Manually invoke the multer middleware to handle errors (like file type rejection)
   * explicitly instead of letting them bubble up as generic 500 errors.
   */
  upload.single('image')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // Handle Multer-specific errors (e.g., file too large)
      return res.status(400).json({ message: `Multer upload error: ${err.message}` });
    } else if (err) {
      // Handle our custom file type error or other unknown errors
      return res.status(400).json({ message: err.message || 'An unknown error occurred during upload' });
    }

    // Check if file was actually uploaded and exists on the request
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided in the request' });
    }

    /**
     * SUCCESS: Return the relative public path.
     * The Express server serves the /backend/uploads folder statically at the /uploads route.
     */
   res.send(`${process.env.BASE_URL}/uploads/${req.file.filename}`);
  });
});

module.exports = router;
