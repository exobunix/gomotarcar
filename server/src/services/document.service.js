const { AppError } = require('../middleware/errorHandler');
const path = require('path');
const fs = require('fs');

const SUPPORTED_IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const SUPPORTED_DOC_MIME = [
  'image/jpeg', 'image/png', 'application/pdf',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

/**
 * Magic bytes / file signatures for validation
 */
const FILE_SIGNATURES = {
  '89504E47': 'image/png',
  'FFD8FF': 'image/jpeg',
  'FFD8FFE0': 'image/jpeg',
  'FFD8FFE1': 'image/jpeg',
  '25504446': 'application/pdf',
  'D0CF11E0': 'application/msword',
  '504B0304': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '00000018': 'image/heic',
  '66747970': 'image/heic',
  '52494646': 'image/webp',
};

class DocumentService {
  /**
   * Validate file type using magic bytes (file signatures)
   */
  validateFileType(filePath, expectedMime) {
    try {
      const buffer = Buffer.alloc(8);
      const fd = fs.openSync(filePath, 'r');
      fs.readSync(fd, buffer, 0, 8, 0);
      fs.closeSync(fd);

      const hexSignature = buffer.toString('hex').toUpperCase();

      // Check against known signatures
      for (const [sig, mime] of Object.entries(FILE_SIGNATURES)) {
        if (hexSignature.startsWith(sig)) {
          const isValid = mime === expectedMime || (
            expectedMime === 'image/jpeg' && mime.startsWith('image/jpeg')
          );
          return { valid: isValid, detectedMime: mime };
        }
      }

      return { valid: false, detectedMime: 'unknown' };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  /**
   * Validate document expiry (e.g., driving license, insurance, PUC)
   */
  validateExpiry(expiryDate) {
    if (!expiryDate) return { valid: true }; // No expiry = no check
    const expiry = new Date(expiryDate);
    const now = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    if (expiry < now) {
      return { valid: false, reason: 'Document has expired', code: 'DOC_EXPIRED' };
    }

    if (expiry < threeMonthsFromNow) {
      return { valid: true, warning: 'Document will expire within 3 months', code: 'DOC_EXPIRING' };
    }

    return { valid: true };
  }

  /**
   * Validate a document upload (file path + metadata)
   */
  async validateDocument(filePath, { documentType, expectedMime, expiryDate, maxSizeMB = 20 } = {}) {
    const errors = [];

    // Check file exists
    if (!fs.existsSync(filePath)) {
      throw new AppError('File not found', 400, 'DOC_FILE_NOT_FOUND');
    }

    // Check file size
    const stats = fs.statSync(filePath);
    const fileSizeMB = stats.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      throw new AppError(
        `File size (${fileSizeMB.toFixed(1)}MB) exceeds maximum allowed (${maxSizeMB}MB)`,
        400,
        'DOC_FILE_TOO_LARGE'
      );
    }

    // Validate magic bytes
    if (expectedMime) {
      const sigResult = this.validateFileType(filePath, expectedMime);
      if (!sigResult.valid) {
        errors.push({
          field: 'fileType',
          message: `File type mismatch. Expected: ${expectedMime}, Detected: ${sigResult.detectedMime}`,
          code: 'DOC_INVALID_TYPE',
        });
      }
    }

    // Validate expiry
    if (expiryDate) {
      const expiryResult = this.validateExpiry(expiryDate);
      if (!expiryResult.valid) {
        errors.push({
          field: 'expiryDate',
          message: expiryResult.reason,
          code: expiryResult.code,
        });
      }
    }

    return {
      valid: errors.length === 0,
      fileSizeMB: parseFloat(fileSizeMB.toFixed(2)),
      extension: path.extname(filePath),
      errors,
    };
  }

  /**
   * Placeholder for OCR text extraction from documents
   * In production, integrate with Google Vision / Tesseract
   */
  async extractText(filePath) {
    console.log(`[Document OCR] Text extraction not implemented (placeholder). File: ${filePath}`);
    return { text: '', confidence: 0 };
  }

  /**
   * Placeholder for document auto-verification
   * In production, would verify against government databases
   */
  async autoVerify(documentData) {
    return {
      verified: false,
      confidence: 0,
      message: 'Auto-verification not configured. Manual verification required.',
      requiresManualReview: true,
    };
  }

  /**
   * Scan file for potential malware signature patterns
   * Basic check - in production use ClamAV or similar
   */
  async scanForMalware(filePath) {
    try {
      const buffer = Buffer.alloc(1024);
      const fd = fs.openSync(filePath, 'r');
      fs.readSync(fd, buffer, 0, 1024, 0);
      fs.closeSync(fd);

      const content = buffer.toString('utf-8').toLowerCase();
      const suspiciousPatterns = ['<?php', '<script', 'powershell', 'eval(', 'base64_decode'];

      for (const pattern of suspiciousPatterns) {
        if (content.includes(pattern)) {
          return { safe: false, reason: `Suspicious content detected: ${pattern}` };
        }
      }

      return { safe: true };
    } catch (error) {
      return { safe: false, error: error.message };
    }
  }

  /**
   * Clean up temporary files
   */
  cleanupFile(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Failed to cleanup file ${filePath}:`, error.message);
    }
  }
}

module.exports = new DocumentService();
