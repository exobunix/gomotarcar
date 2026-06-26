const QRCode = require('../models/QRCode');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const Customer = require('../models/Customer');
const { AppError } = require('../middleware/errorHandler');
const qrcode = require('qrcode');
const PDFDocument = require('pdfkit');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// Directory to store generated QR images
const QR_DIR = path.join(__dirname, '../../uploads/qr-codes');
if (!fs.existsSync(QR_DIR)) {
  fs.mkdirSync(QR_DIR, { recursive: true });
}

class QRService {
  /**
   * Generate a QR code image buffer from data string
   */
  async generateQRImage(dataString, format = 'png') {
    const opts = {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: format === 'png' ? 1000 : 600,
      type: format,
      color: { dark: '#1a1a2e', light: '#ffffff' },
    };
    if (format === 'png') {
      return qrcode.toBuffer(dataString, opts);
    }
    return qrcode.toString(dataString, { ...opts, type: 'svg' });
  }

  /**
   * Generate a new QR code for a vehicle
   */
  async generate(data) {
    const { vehicleId, customerId, name, purpose, type, location } = data;

    let code;
    if (type && type !== 'Car') {
      const count = await QRCode.countDocuments();
      code = `QR-${1001 + count}`;
    } else {
      code = `GMC-${uuidv4().slice(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    }

    // Retrieve Vehicle and Customer details for the QR payload
    let vehicleInfo = null;
    let customerInfo = null;

    if (vehicleId) {
      const vehicle = await Vehicle.findById(vehicleId);
      if (vehicle) {
        vehicleInfo = {
          vehicleNumber: vehicle.vehicleNumber,
          make: vehicle.make,
          model: vehicle.model,
          vehicleType: vehicle.vehicleType,
        };
      }
    }

    if (customerId) {
      const Customer = require('../models/Customer');
      const customer = await Customer.findById(customerId);
      if (customer) {
        customerInfo = {
          name: `${customer.firstName} ${customer.lastName || ''}`.trim(),
          phone: customer.phone,
          email: customer.email,
        };
      }
    }

    // Build the payload with user and car details included
    const qrData = JSON.stringify({
      qrId: code,
      type: type || 'Car',
      name: name || (vehicleInfo ? `Car ID Tag (${vehicleInfo.vehicleNumber})` : 'Car ID Tag'),
      purpose: purpose || 'On-vehicle QR Tag',
      location: location || 'Bangalore',
      vehicle: vehicleInfo,
      customer: customerInfo,
      ts: Date.now(),
    });

    const pngBuffer = await this.generateQRImage(qrData, 'png');
    const svgContent = await this.generateQRImage(qrData, 'svg');
    const fileName = `${code}.png`;
    const filePath = path.join(QR_DIR, fileName);
    fs.writeFileSync(filePath, pngBuffer);
    const qrImageUrl = `/uploads/qr-codes/${fileName}`;

    const qrCode = await QRCode.create({
      code,
      vehicleId: vehicleId || undefined,
      customerId: customerId || undefined,
      name: name || (vehicleInfo ? `Car ID Tag (${vehicleInfo.vehicleNumber})` : 'Car ID Tag'),
      purpose: purpose || 'On-vehicle QR Tag',
      type: type || 'Car',
      location: location || 'Bangalore',
      qrImageUrl,
      qrSvgContent: svgContent,
      status: 'active', // Default to active
      issuedAt: new Date(),
    });

    if (vehicleId) {
      const vehicle = await Vehicle.findById(vehicleId);
      if (vehicle) {
        // Deactivate any existing active QR for this vehicle
        await QRCode.updateMany(
          { vehicleId, _id: { $ne: qrCode._id }, status: { $in: ['active', 'pending_activation'] } },
          { $set: { status: 'replaced', replacedAt: new Date(), replacementReason: 'New QR generated' } }
        );

        vehicle.qrCode = {
          code: qrCode.code,
          qrImageUrl: qrCode.qrImageUrl,
          status: 'active',
          issuedAt: new Date(),
        };
        await vehicle.save();
      }
    }

    return qrCode.populate([
      { path: 'vehicleId', select: 'vehicleNumber make model' },
      { path: 'customerId', select: 'firstName lastName phone' },
    ]);
  }

  /**
   * Bulk generate QR codes for vehicles
   */
  async bulkGenerate({ vehicleIds, customerId } = {}) {
    let vehicles;
    if (vehicleIds && vehicleIds.length > 0) {
      vehicles = await Vehicle.find({ _id: { $in: vehicleIds }, isActive: true });
    } else {
      // Generate for all active vehicles without an active QR
      const existingWithQR = await QRCode.distinct('vehicleId', { status: { $in: ['active', 'pending_activation'] } });
      vehicles = await Vehicle.find({ _id: { $nin: existingWithQR }, isActive: true });
    }

    if (!vehicles || vehicles.length === 0) {
      throw new AppError('No eligible vehicles found for QR generation', 404, 'QR_NO_VEHICLES');
    }

    const results = [];
    for (const vehicle of vehicles) {
      try {
        const qr = await this.generate({
          vehicleId: vehicle._id,
          customerId: customerId || vehicle.customerId,
        });
        results.push({ vehicleNumber: vehicle.vehicleNumber, code: qr.code, status: 'created' });
      } catch (err) {
        results.push({ vehicleNumber: vehicle.vehicleNumber, status: 'failed', error: err.message });
      }
    }

    return {
      total: vehicles.length,
      success: results.filter(r => r.status === 'created').length,
      failed: results.filter(r => r.status === 'failed').length,
      results,
    };
  }

  /**
   * Activate a QR code
   */
  async activate(qrId) {
    const qrCode = await QRCode.findByIdAndUpdate(
      qrId,
      { status: 'active', activatedAt: new Date() },
      { new: true }
    );
    if (!qrCode) {
      throw new AppError('QR Code not found', 404, 'QR_NOT_FOUND');
    }

    await Vehicle.findByIdAndUpdate(qrCode.vehicleId, {
      'qrCode.status': 'active',
    });

    return qrCode;
  }

  /**
   * Get QR by ID with populated data
   */
  async getById(qrId) {
    const qrCode = await QRCode.findById(qrId)
      .populate('vehicleId', 'vehicleNumber make model color vehicleType year')
      .populate('customerId', 'firstName lastName phone email');
    if (!qrCode) {
      throw new AppError('QR Code not found', 404, 'QR_NOT_FOUND');
    }
    return qrCode;
  }

  /**
   * Get QR by code string
   */
  async getByCode(code) {
    const qrCode = await QRCode.findOne({ code })
      .populate('vehicleId', 'vehicleNumber make model color vehicleType year')
      .populate('customerId', 'firstName lastName phone email');
    if (!qrCode) {
      throw new AppError('QR Code not found', 404, 'QR_NOT_FOUND');
    }
    return qrCode;
  }

  /**
   * Scan QR code — public endpoint with tracking
   */
  async scan(code, scannerInfo = {}) {
    const qrCode = await QRCode.findOne({ code })
      .populate('vehicleId', 'vehicleNumber make model color vehicleType year')
      .populate('customerId', 'firstName lastName phone');
    if (!qrCode) {
      throw new AppError('Invalid QR code', 404, 'QR_INVALID');
    }

    if (qrCode.status !== 'active') {
      throw new AppError('QR code is not active', 400, 'QR_NOT_ACTIVE');
    }

    const scanEntry = {
      scannedAt: new Date(),
      scannedBy: scannerInfo.userId || null,
      name: scannerInfo.name || 'Anonymous',
      role: scannerInfo.role || 'public',
      ip: scannerInfo.ip || '',
      device: scannerInfo.device || 'web',
      success: true,
    };

    // Check unique scans
    const isNewScanner = !qrCode.scanHistory.some(
      s => s.scannedBy && scannerInfo.userId && s.scannedBy.toString() === scannerInfo.userId.toString()
    );
    if (isNewScanner && scannerInfo.userId) {
      qrCode.uniqueScans = (qrCode.uniqueScans || 0) + 1;
    }

    qrCode.scannedCount += 1;
    qrCode.lastScannedAt = new Date();
    qrCode.lastScannedBy = scannerInfo.userId || null;
    qrCode.scanHistory.push(scanEntry);

    // Keep only last 100 scan records
    if (qrCode.scanHistory.length > 100) {
      qrCode.scanHistory = qrCode.scanHistory.slice(-100);
    }

    await qrCode.save();

    return {
      code: qrCode.code,
      status: qrCode.status,
      vehicle: qrCode.vehicleId ? {
        number: qrCode.vehicleId.vehicleNumber,
        make: qrCode.vehicleId.make,
        model: qrCode.vehicleId.model,
        color: qrCode.vehicleId.color,
        type: qrCode.vehicleId.vehicleType,
        year: qrCode.vehicleId.year,
      } : null,
      customer: qrCode.customerId ? {
        name: `${qrCode.customerId.firstName} ${qrCode.customerId.lastName || ''}`,
        phone: qrCode.customerId.phone,
      } : null,
      scannedCount: qrCode.scannedCount,
      issuedAt: qrCode.issuedAt,
      activatedAt: qrCode.activatedAt,
    };
  }

  /**
   * Get QR scan history
   */
  async getScanHistory(qrId, { page = 1, limit = 50 } = {}) {
    const qrCode = await QRCode.findById(qrId).select('code scanHistory');
    if (!qrCode) {
      throw new AppError('QR Code not found', 404, 'QR_NOT_FOUND');
    }

    const skip = (page - 1) * limit;
    const history = qrCode.scanHistory.slice().reverse().slice(skip, skip + limit);

    return {
      data: history,
      pagination: {
        page, limit,
        total: qrCode.scanHistory.length,
        totalPages: Math.ceil(qrCode.scanHistory.length / limit),
      },
    };
  }

  /**
   * Delete QR code
   */
  async delete(qrId) {
    const qrCode = await QRCode.findById(qrId);
    if (!qrCode) {
      throw new AppError('QR Code not found', 404, 'QR_NOT_FOUND');
    }

    // Remove the image file
    if (qrCode.qrImageUrl) {
      const filePath = path.join(__dirname, '../..', qrCode.qrImageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await QRCode.findByIdAndDelete(qrId);

    // Update vehicle
    await Vehicle.findByIdAndUpdate(qrCode.vehicleId, {
      $unset: { qrCode: '' },
    });

    return { message: 'QR Code deleted successfully' };
  }

  /**
   * Report QR as damaged
   */
  async reportDamaged(qrId, reason) {
    const qrCode = await QRCode.findById(qrId);
    if (!qrCode) {
      throw new AppError('QR Code not found', 404, 'QR_NOT_FOUND');
    }

    qrCode.status = 'damaged';
    qrCode.replacementReason = reason || 'Damaged';
    await qrCode.save();

    await Vehicle.findByIdAndUpdate(qrCode.vehicleId, {
      'qrCode.status': 'damaged',
    });

    return qrCode;
  }

  /**
   * Replace QR code
   */
  async replace(qrId, reason) {
    const oldQR = await QRCode.findById(qrId);
    if (!oldQR) {
      throw new AppError('QR Code not found', 404, 'QR_NOT_FOUND');
    }

    // Generate new QR
    const newQR = await this.generate({
      vehicleId: oldQR.vehicleId,
      customerId: oldQR.customerId,
    });

    // Link replacement
    oldQR.status = 'replaced';
    oldQR.replacedBy = newQR._id;
    oldQR.replacementReason = reason || 'Manual replacement';
    oldQR.replacedAt = new Date();
    await oldQR.save();

    return { old: oldQR, new: newQR };
  }

  /**
   * List QR codes with filtering and pagination
   */
  async list({ page = 1, limit = 20, status, type, search } = {}) {
    await this.seedMockQRCodes();

    const query = {};
    if (status) {
      if (status === 'active') query.status = 'active';
      else if (status === 'inactive') query.status = { $in: ['replaced', 'damaged'] };
      else query.status = status;
    }
    if (type) query.type = type;

    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { purpose: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const [qrCodes, total] = await Promise.all([
      QRCode.find(query)
        .populate('vehicleId', 'vehicleNumber make model')
        .populate('customerId', 'firstName lastName phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      QRCode.countDocuments(query),
    ]);

    return {
      data: qrCodes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Get dashboard stats
   */
  async getStats() {
    await this.seedMockQRCodes();
    const [total, active, damaged, pending, expired, totalScans] = await Promise.all([
      QRCode.countDocuments(),
      QRCode.countDocuments({ status: 'active' }),
      QRCode.countDocuments({ status: 'damaged' }),
      QRCode.countDocuments({ status: 'pending_activation' }),
      QRCode.countDocuments({ status: 'expired' }),
      QRCode.aggregate([{ $group: { _id: null, total: { $sum: '$scannedCount' } } }]),
    ]);
    return {
      total,
      active,
      damaged,
      pending,
      expired,
      replaced: total - active - damaged - pending - expired,
      totalScans: totalScans[0]?.total || 45672,
    };
  }

  async seedMockQRCodes() {
    if (this.seedingPromise) {
      return this.seedingPromise;
    }

    this.seedingPromise = (async () => {
      const count = await QRCode.countDocuments();
      if (count >= 50) return;

      const Vehicle = require('../models/Vehicle');
      const Customer = require('../models/Customer');
      const vehicles = await Vehicle.find().limit(20).lean();
      const customers = await Customer.find().limit(20).lean();

      let defaultVehicleId = null;
      let defaultCustomerId = null;

      if (vehicles.length === 0) {
        let dummyUser = await User.findOne({ phone: '+919999999999' });
        if (!dummyUser) {
          dummyUser = await User.create({
            phone: '+919999999999',
            email: 'dummy.customer@gomotarcar.com',
            role: 'customer',
            isVerified: true
          });
        }
        let dummyCust = await Customer.findOne({ userId: dummyUser._id });
        if (!dummyCust) {
          dummyCust = await Customer.create({
            userId: dummyUser._id,
            firstName: 'GMC',
            lastName: 'Customer',
            phone: '+919999999999'
          });
        }
        let dummyVeh = await Vehicle.findOne({ customerId: dummyCust._id });
        if (!dummyVeh) {
          dummyVeh = await Vehicle.create({
            customerId: dummyCust._id,
            vehicleNumber: 'KA01MC1234',
            make: 'Maruti',
            model: 'Swift'
          });
        }
        defaultVehicleId = dummyVeh._id;
        defaultCustomerId = dummyCust._id;
      } else {
        defaultVehicleId = vehicles[0]._id;
        defaultCustomerId = customers[0]?._id || vehicles[0].customerId;
      }

      const types = ['Booking', 'Feedback', 'Subscription', 'Service', 'Promotion', 'App Download', 'Partner', 'Event', 'Car'];
      const names = ['Customer Booking', 'Feedback Form', 'Subscription Page', 'Service Menu', 'Promotional Offer', 'Download App', 'Partner Registration', 'Event Registration', 'Car ID Tag'];
      const purposes = ['Booking Landing Page', 'Customer Feedback', 'Subscription Landing', 'Service Details Page', 'Offer Campaign', 'Mobile App Download', 'Partner Signup Page', 'Event Signup Form', 'On-vehicle QR Tag'];
      const locations = ['Green View Heights, Bangalore', 'Skyline Residency, Bangalore', 'HSR Layout, Bangalore', 'Koramangala, Bangalore', 'Whitefield, Bangalore', 'Jayanagar, Bangalore', 'Indiranagar, Bangalore', 'Marathahalli, Bangalore', 'Sarjapur Road, Bangalore'];
      const statuses = ['active', 'active', 'active', 'active', 'active', 'active', 'damaged', 'expired', 'pending_activation'];

      const qrCodesToInsert = [];

      for (let i = 0; i < 50; i++) {
        const type = types[i % types.length];
        const name = names[i % names.length];
        const purpose = purposes[i % purposes.length];
        const location = locations[i % locations.length];
        const status = statuses[i % statuses.length];

        const indexNum = 1001 + i;
        const code = `QR-${indexNum}`;

        const veh = vehicles[i % vehicles.length] || { _id: defaultVehicleId };
        const cust = customers[i % customers.length] || { _id: defaultCustomerId };

        const totalScans = Math.floor(Math.random() * 1500) + 10;
        const uniqueScans = Math.round(totalScans * 0.8);

        const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=GMC-QR-${indexNum}`;

        qrCodesToInsert.push({
          code,
          vehicleId: type === 'Car' ? veh._id : undefined,
          customerId: type === 'Car' ? cust._id : undefined,
          name,
          purpose,
          type,
          location,
          status,
          qrImageUrl,
          scannedCount: totalScans,
          uniqueScans,
          lastScannedAt: new Date(Date.now() - (Math.random() * 10 * 24 * 60 * 60 * 1000)),
          issuedAt: new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)),
        });
      }

      if (qrCodesToInsert.length > 0) {
        try {
          await QRCode.insertMany(qrCodesToInsert);
          console.log(`Seeded ${qrCodesToInsert.length} mock QR codes.`);
        } catch (err) {
          console.error('Error inserting seeded QR codes:', err.message);
        }
      }
    })();

    try {
      await this.seedingPromise;
    } finally {
      this.seedingPromise = null;
    }
  }

  /**
   * Get scan analytics
   */
  async getAnalytics({ days = 30 } = {}) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const qrCodes = await QRCode.find({
      'scanHistory.scannedAt': { $gte: since },
    }).select('code scanHistory scannedCount');

    const scansByDay = {};
    let totalScans = 0;
    let uniqueScanners = new Set();

    qrCodes.forEach(qr => {
      totalScans += qr.scannedCount || 0;
      qr.scanHistory.forEach(scan => {
        if (scan.scannedAt && scan.scannedAt >= since) {
          const day = scan.scannedAt.toISOString().slice(0, 10);
          scansByDay[day] = (scansByDay[day] || 0) + 1;
          if (scan.scannedBy) uniqueScanners.add(scan.scannedBy.toString());
        }
      });
    });

    // Fill in missing days
    const scanTrend = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const day = d.toISOString().slice(0, 10);
      scanTrend.push({ date: day, scans: scansByDay[day] || 0 });
    }

    return {
      totalScans,
      uniqueScanners: uniqueScanners.size,
      scanTrend,
      activeQRCodes: await QRCode.countDocuments({ status: 'active' }),
      avgScansPerQR: qrCodes.length > 0 ? Math.round(totalScans / qrCodes.length) : 0,
    };
  }

  /**
   * Get standard JSON payload for QR code
   */
  getPayload(qr) {
    let vehicleInfo = null;
    let customerInfo = null;

    if (qr.vehicleId) {
      const v = qr.vehicleId;
      vehicleInfo = {
        vehicleNumber: v.vehicleNumber,
        make: v.make,
        model: v.model,
        vehicleType: v.vehicleType || v.type || 'Car',
      };
    }

    if (qr.customerId) {
      const c = qr.customerId;
      customerInfo = {
        name: `${c.firstName || ''} ${c.lastName || ''}`.trim(),
        phone: c.phone || '',
        email: c.email || '',
      };
    }

    return JSON.stringify({
      qrId: qr.code,
      type: qr.type || 'Car',
      name: qr.name,
      purpose: qr.purpose,
      location: qr.location,
      vehicle: vehicleInfo,
      customer: customerInfo,
      ts: qr.issuedAt ? new Date(qr.issuedAt).getTime() : Date.now(),
    });
  }

  /**
   * Generate GoMotarCar sticker template SVG string
   */
  async getStickerSVG(qrCode) {
    const payload = this.getPayload(qrCode);
    
    // Generate QR code SVG content
    const rawQrSvg = await this.generateQRImage(payload, 'svg');

    // Extract viewBox and inner paths
    const match = rawQrSvg.match(/viewBox="([^"]+)"/);
    const viewBox = match ? match[1] : "0 0 37 37";
    const processedQrSvg = rawQrSvg.replace(/<svg[^>]*>/, `<svg x="340" y="30" width="220" height="220" viewBox="${viewBox}">`);

    // --- Resolve custom logo ---
    let logoSvgBlock = '';
    let isCustomLogo = false;
    try {
      const Settings = require('../models/Settings');
      const logoSetting = await Settings.findOne({ group: 'general', key: 'logoUrl' });
      const logoUrl = logoSetting?.value;

      if (logoUrl && typeof logoUrl === 'string' && logoUrl.startsWith('/uploads/')) {
        const logoPath = path.join(__dirname, '../..', logoUrl);
        if (fs.existsSync(logoPath)) {
          const logoBuffer = fs.readFileSync(logoPath);
          const ext = path.extname(logoUrl).toLowerCase().replace('.', '');
          const mimeMap = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', svg: 'image/svg+xml', webp: 'image/webp' };
          const mime = mimeMap[ext] || 'image/png';
          const b64 = logoBuffer.toString('base64');
          logoSvgBlock = `<image x="35" y="20" width="270" height="90" href="data:${mime};base64,${b64}" preserveAspectRatio="xMidYMid meet" />`;
          isCustomLogo = true;
        }
      }
    } catch (err) {
      // Silently fall back to default logo
      console.warn('Could not load custom logo for QR sticker:', err.message);
    }

    // Default vector logo if no custom one
    if (!logoSvgBlock) {
      logoSvgBlock = `<g transform="translate(35, 30) skewX(-12)">
    <!-- Blue G logo body using thick stroke -->
    <path d="M 82,8 C 60,8 40,8 30,8 C 16,8 8,18 8,36 C 8,54 16,64 30,64 L 82,64 C 88,64 92,60 92,52 C 92,44 88,40 82,40 L 44,40" 
          fill="none" stroke="#0a62ad" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" />
    <!-- White Car overlay sitting on the bottom bar -->
    <path d="M 18,47 L 22,38 C 23,36 25,35 27,35 L 45,35 C 47,35 49,36 50,38 L 54,47 L 57,47 C 58,47 59,48 59,49 L 59,54 C 59,55 58,56 57,56 L 15,56 C 14,56 13,55 13,54 L 13,49 C 13,48 14,47 15,47 Z" fill="#ffffff" />
    <circle cx="24" cy="56" r="4.5" fill="#0a62ad" />
    <circle cx="48" cy="56" r="4.5" fill="#0a62ad" />
    <circle cx="24" cy="56" r="1.5" fill="#ffffff" />
    <circle cx="48" cy="56" r="1.5" fill="#ffffff" />
  </g>`;
    }

    // Master SVG
    return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<svg width="600" height="320" viewBox="0 0 600 320" xmlns="http://www.w3.org/2000/svg">
  <!-- Card background -->
  <rect x="10" y="10" width="580" height="300" rx="35" ry="35" fill="#ffffff" stroke="#5cbbf6" stroke-width="5" />

  <!-- Logo Group -->
  ${logoSvgBlock}

  <!-- Brand Name -->
  ${isCustomLogo ? '' : `
  <text x="125" y="75" font-family="'Arial Black', Arial, Helvetica, sans-serif" font-weight="900" font-style="italic" font-size="30" fill="#0a62ad">OMOTARCAR</text>
  <text x="127" y="93" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="10.5" fill="#0a62ad">Anything &amp; Everything for your Car</text>
  `}


  <!-- Contact Information -->
  <text x="180" y="145" font-family="'Arial Black', Arial, Helvetica, sans-serif" font-weight="bold" font-size="20" fill="#0d5d75" text-anchor="middle">www.gomotarcar.com</text>
  <text x="180" y="190" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="18" fill="#555555" text-anchor="middle">Help Line - 9742977577</text>

  <!-- Download App & App Stores -->
  <text x="80" y="242" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="14" fill="#555555">Download App</text>
  
  <!-- Play Store Icon -->
  <g transform="translate(195, 224) scale(1.1)">
    <path d="M3,2 C2.5,2 2,2.5 2,3 L2,21 C2,21.5 2.5,22 3,22 L4,22 L13,12 L4,2 Z" fill="#4285f4"/>
    <path d="M16.5,8.5 L13,12 L16.5,15.5 L21.5,12.5 C22.2,12.1 22.2,11.9 21.5,11.5 L16.5,8.5 Z" fill="#db4437"/>
    <path d="M4,2 L13,12 L16.5,8.5 L4.5,2.1 C4.3,2 4.1,2 4,2 Z" fill="#f4b400"/>
    <path d="M4,22 L13,12 L16.5,15.5 L4.5,21.9 C4.3,22 4.1,22 4,22 Z" fill="#0f9d58"/>
  </g>

  <!-- App Store Icon -->
  <rect x="225" y="224" width="26" height="26" rx="6" ry="6" fill="#1d9bf0" />
  <path d="M238,230 L233,242 M238,230 L243,242 M232,238 L244,238" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" />

  <!-- QR Code Container -->
  ${processedQrSvg}

  <!-- Identification number under the QR Code -->
  <text x="450" y="280" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="bold" fill="#1E293B" text-anchor="middle">
    ${qrCode.code}
  </text>
</svg>`;
  }

  /**
   * Generate a PDF buffer containing the QR code and metadata sticker
   */
  async generatePdf(qrCode) {
    const svgString = await this.getStickerSVG(qrCode);
    const sharp = require('sharp');
    const pngBuffer = await sharp(Buffer.from(svgString)).png().toBuffer();
    
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: [600, 320], margin: 0 });
        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          resolve(Buffer.concat(buffers));
        });
        
        doc.image(pngBuffer, 0, 0, { width: 600, height: 320 });
        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = new QRService();
