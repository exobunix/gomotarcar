const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { uploadImage, uploadDocument, uploadVideo, handleUploadError } = require('../middleware/upload');
const documentService = require('../services/document.service');
const fs = require('fs');
const path = require('path');

/**
 * Per-user upload tracking for quota management
 */
const uploadQuota = new Map();
const MAX_UPLOADS_PER_USER_PER_HOUR = 50;
const QUOTA_WINDOW_MS = 3600000; // 1 hour

const { AppError } = require('../middleware/errorHandler');

const checkUploadQuota = (userId) => {
  const now = Date.now();
  const windowStart = now - QUOTA_WINDOW_MS;

  if (!uploadQuota.has(userId)) {
    uploadQuota.set(userId, []);
  }

  const timestamps = uploadQuota.get(userId).filter(t => t > windowStart);

  if (timestamps.length >= MAX_UPLOADS_PER_USER_PER_HOUR) {
    throw new AppError(
      `Upload quota exceeded. Max ${MAX_UPLOADS_PER_USER_PER_HOUR} uploads per hour.`,
      429,
      'UPLOAD_QUOTA_EXCEEDED'
    );
  }

  timestamps.push(now);
  uploadQuota.set(userId, timestamps);

  // Cleanup
  setTimeout(() => {
    const current = uploadQuota.get(userId) || [];
    uploadQuota.set(userId, current.filter(t => t > Date.now() - QUOTA_WINDOW_MS));
  }, QUOTA_WINDOW_MS);
};

/**
 * POST /uploads/image — Upload image with magic bytes validation
 */
router.post('/image', authenticate, (req, res, next) => {    try {
      checkUploadQuota(req.userId);
      next();
    } catch (err) {
      return next(err);
    }
}, uploadImage.single('image'), handleUploadError, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: { code: 'NO_FILE', message: 'No image file provided' },
    });
  }

  // Validate magic bytes
  const validation = documentService.validateFileType(req.file.path, req.file.mimetype);
  if (!validation.valid) {
    // Clean up invalid file
    documentService.cleanupFile(req.file.path);
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_FILE_TYPE',
        message: `File type mismatch. Expected: ${req.file.mimetype}, Detected: ${validation.detectedMime}`,
      },
    });
  }

  // Malware scan
  const scanResult = await documentService.scanForMalware(req.file.path);
  if (!scanResult.safe) {
    documentService.cleanupFile(req.file.path);
    return res.status(400).json({
      success: false,
      error: { code: 'FILE_SUSPICIOUS', message: scanResult.reason },
    });
  }

  res.status(200).json({
    success: true,
    data: {
      url: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
  });
});

/**
 * POST /uploads/document — Upload document with magic bytes validation
 */
router.post('/document', authenticate, (req, res, next) => {    try {
      checkUploadQuota(req.userId);
      next();
    } catch (err) {
      return next(err);
    }
}, uploadDocument.single('document'), handleUploadError, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: { code: 'NO_FILE', message: 'No document file provided' },
    });
  }

  // Validate magic bytes
  const validation = documentService.validateFileType(req.file.path, req.file.mimetype);
  if (!validation.valid) {
    documentService.cleanupFile(req.file.path);
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_FILE_TYPE',
        message: `File type mismatch. Expected: ${req.file.mimetype}, Detected: ${validation.detectedMime}`,
      },
    });
  }

  // Malware scan
  const scanResult = await documentService.scanForMalware(req.file.path);
  if (!scanResult.safe) {
    documentService.cleanupFile(req.file.path);
    return res.status(400).json({
      success: false,
      error: { code: 'FILE_SUSPICIOUS', message: scanResult.reason },
    });
  }

  // Validate document metadata if provided
  if (req.body.documentType) {
    const docValidation = await documentService.validateDocument(req.file.path, {
      documentType: req.body.documentType,
      expectedMime: req.file.mimetype,
      expiryDate: req.body.expiryDate,
    });

    if (!docValidation.valid) {
      documentService.cleanupFile(req.file.path);
      return res.status(400).json({
        success: false,
        error: {
          code: 'DOCUMENT_VALIDATION_FAILED',
          message: 'Document validation failed',
          errors: docValidation.errors,
        },
      });
    }
  }

  res.status(200).json({
    success: true,
    data: {
      url: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
  });
});

/**
 * POST /uploads/video — Upload video (size limited by multer config)
 */
router.post('/video', authenticate, (req, res, next) => {    try {
      checkUploadQuota(req.userId);
      next();
    } catch (err) {
      return next(err);
    }
}, uploadVideo.single('video'), handleUploadError, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: { code: 'NO_FILE', message: 'No video file provided' },
    });
  }

  res.status(200).json({
    success: true,
    data: {
      url: `/uploads/${req.file.filename}`,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    },
  });
});

/**
 * DELETE /uploads/:filename — Delete an uploaded file
 */
router.delete('/:filename', authenticate, (req, res) => {
  const filePath = path.resolve(__dirname, '../../uploads', req.params.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    res.status(200).json({ success: true, message: 'File deleted' });
  } else {
    res.status(404).json({
      success: false,
      error: { code: 'FILE_NOT_FOUND', message: 'File not found' },
    });
  }
});

module.exports = router;
