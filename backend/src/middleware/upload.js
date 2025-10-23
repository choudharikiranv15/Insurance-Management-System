const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';

    // Determine folder based on file type and purpose
    if (file.fieldname === 'avatar' || file.fieldname === 'profileImage') {
      uploadPath += 'profiles/';
    } else if (file.fieldname === 'claimDocument') {
      uploadPath += 'claims/';
    } else if (file.fieldname === 'policyDocument') {
      uploadPath += 'policies/';
    } else if (file.fieldname === 'idDocument') {
      uploadPath += 'documents/';
    } else {
      uploadPath += 'general/';
    }

    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const basename = path.basename(file.originalname, extension);

    // Sanitize filename
    const sanitizedBasename = basename.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${sanitizedBasename}_${uniqueSuffix}${extension}`;

    cb(null, filename);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Define allowed file types
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  const allowedDocumentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ];

  let allowedTypes = [];

  // Set allowed types based on field name
  if (file.fieldname === 'avatar' || file.fieldname === 'profileImage') {
    allowedTypes = allowedImageTypes;
  } else if (file.fieldname === 'claimDocument' || file.fieldname === 'policyDocument' || file.fieldname === 'idDocument') {
    allowedTypes = [...allowedImageTypes, ...allowedDocumentTypes];
  } else {
    allowedTypes = [...allowedImageTypes, ...allowedDocumentTypes];
  }

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files at once
  }
});

// Different upload configurations for different use cases
const uploadSingle = (fieldName) => upload.single(fieldName);
const uploadMultiple = (fieldName, maxCount = 5) => upload.array(fieldName, maxCount);
const uploadFields = (fields) => upload.fields(fields);

// Profile image upload
const uploadProfileImage = uploadSingle('avatar');

// Claim documents upload (multiple files)
const uploadClaimDocuments = uploadMultiple('claimDocument', 10);

// Policy documents upload
const uploadPolicyDocuments = uploadMultiple('policyDocument', 5);

// ID documents upload
const uploadIdDocuments = uploadMultiple('idDocument', 3);

// Mixed uploads for profile (avatar + documents)
const uploadProfileFiles = uploadFields([
  { name: 'avatar', maxCount: 1 },
  { name: 'idDocument', maxCount: 3 }
]);

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    let message = 'File upload error';

    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File size too large. Maximum size is 5MB.';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files. Maximum allowed files exceeded.';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field.';
        break;
      case 'LIMIT_PART_COUNT':
        message = 'Too many parts in the form.';
        break;
      case 'LIMIT_FIELD_KEY':
        message = 'Field name too long.';
        break;
      case 'LIMIT_FIELD_VALUE':
        message = 'Field value too long.';
        break;
      case 'LIMIT_FIELD_COUNT':
        message = 'Too many fields.';
        break;
      default:
        message = error.message;
    }

    return res.status(400).json({
      success: false,
      message: message
    });
  }

  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
};

// Helper function to delete uploaded files (cleanup on error)
const deleteUploadedFiles = (files) => {
  if (!files) return;

  const filesToDelete = Array.isArray(files) ? files : [files];

  filesToDelete.forEach(file => {
    if (file && file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  });
};

// Middleware to process uploaded files and add to req
const processUploadedFiles = (req, res, next) => {
  // Parse JSON strings in form data (for multipart/form-data)
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string' && (req.body[key].startsWith('{') || req.body[key].startsWith('['))) {
        try {
          req.body[key] = JSON.parse(req.body[key]);
        } catch (e) {
          // If parsing fails, keep as string
        }
      }
    });
  }

  if (req.files || req.file) {
    const uploadedFiles = [];

    if (req.file) {
      uploadedFiles.push({
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: `/uploads/${req.file.path.replace(/\\/g, '/')}`
      });
    }

    if (req.files) {
      if (Array.isArray(req.files)) {
        req.files.forEach(file => {
          uploadedFiles.push({
            fieldname: file.fieldname,
            originalname: file.originalname,
            filename: file.filename,
            path: file.path,
            size: file.size,
            mimetype: file.mimetype,
            url: `/uploads/${file.path.replace(/\\/g, '/')}`
          });
        });
      } else {
        Object.keys(req.files).forEach(fieldname => {
          req.files[fieldname].forEach(file => {
            uploadedFiles.push({
              fieldname: file.fieldname,
              originalname: file.originalname,
              filename: file.filename,
              path: file.path,
              size: file.size,
              mimetype: file.mimetype,
              url: `/uploads/${file.path.replace(/\\/g, '/')}`
            });
          });
        });
      }
    }

    req.uploadedFiles = uploadedFiles;
  }

  next();
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  uploadProfileImage,
  uploadClaimDocuments,
  uploadPolicyDocuments,
  uploadIdDocuments,
  uploadProfileFiles,
  handleUploadError,
  deleteUploadedFiles,
  processUploadedFiles
};