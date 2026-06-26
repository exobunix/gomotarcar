const qrService = require('../services/qr.service');

const qrController = {
  generate: async (req, res, next) => {
    try {
      const qr = await qrService.generate(req.body);
      res.status(201).json({ success: true, data: qr });
    } catch (error) { next(error); }
  },

  bulkGenerate: async (req, res, next) => {
    try {
      const result = await qrService.bulkGenerate(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  list: async (req, res, next) => {
    try {
      const result = await qrService.list(req.query);
      res.status(200).json({ success: true, ...result });
    } catch (error) { next(error); }
  },

  getById: async (req, res, next) => {
    try {
      const qr = await qrService.getById(req.params.id);
      res.status(200).json({ success: true, data: qr });
    } catch (error) { next(error); }
  },

  getByCode: async (req, res, next) => {
    try {
      const qr = await qrService.getByCode(req.params.code);
      res.status(200).json({ success: true, data: qr });
    } catch (error) { next(error); }
  },

  scan: async (req, res, next) => {
    try {
      const { code } = req.body;
      const scannerInfo = {
        userId: req.user?.id || null,
        name: req.user?.name || 'Anonymous',
        role: req.user?.role || 'public',
        ip: req.ip || req.headers['x-forwarded-for'] || '',
        device: req.headers['user-agent']?.slice(0, 100) || 'web',
      };
      const result = await qrService.scan(code, scannerInfo);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  /**
   * Public QR verification — no auth required
   * GET /api/qr/verify/:code
   */
  verify: async (req, res, next) => {
    try {
      const { code } = req.params;
      const scannerInfo = {
        name: 'Public',
        role: 'public',
        ip: req.ip || req.headers['x-forwarded-for'] || '',
        device: req.headers['user-agent']?.slice(0, 100) || 'web',
      };
      const result = await qrService.scan(code, scannerInfo);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  activate: async (req, res, next) => {
    try {
      const qr = await qrService.activate(req.params.id);
      res.status(200).json({ success: true, data: qr });
    } catch (error) { next(error); }
  },

  delete: async (req, res, next) => {
    try {
      const result = await qrService.delete(req.params.id);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  reportDamaged: async (req, res, next) => {
    try {
      const { reason } = req.body;
      const qr = await qrService.reportDamaged(req.params.id, reason);
      res.status(200).json({ success: true, data: qr });
    } catch (error) { next(error); }
  },

  replace: async (req, res, next) => {
    try {
      const { reason } = req.body;
      const result = await qrService.replace(req.params.id, reason);
      res.status(200).json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  getStats: async (req, res, next) => {
    try {
      const stats = await qrService.getStats();
      res.status(200).json({ success: true, data: stats });
    } catch (error) { next(error); }
  },

  getAnalytics: async (req, res, next) => {
    try {
      const analytics = await qrService.getAnalytics(req.query);
      res.status(200).json({ success: true, data: analytics });
    } catch (error) { next(error); }
  },

  getScanHistory: async (req, res, next) => {
    try {
      const history = await qrService.getScanHistory(req.params.id, req.query);
      res.status(200).json({ success: true, ...history });
    } catch (error) { next(error); }
  },

  /**
   * GET /api/qr/:id/image — Serve inline sticker card image
   */
  serveImage: async (req, res, next) => {
    try {
      console.log('--- serveImage REQUEST --- ID:', req.params.id);
      const qr = await qrService.getById(req.params.id);
      const svgString = await qrService.getStickerSVG(qr);
      const sharp = require('sharp');
      const pngBuffer = await sharp(Buffer.from(svgString)).png().toBuffer();
      res.setHeader('Content-Type', 'image/png');
      console.log('--- serveImage SUCCESS --- ID:', req.params.id, 'Buffer length:', pngBuffer.length);
      res.send(pngBuffer);
    } catch (error) {
      console.error('--- serveImage ERROR --- ID:', req.params.id, error);
      next(error);
    }
  },

  /**
   * GET /api/qr/download/:id/png — Download sticker QR as PNG
   */
  downloadPng: async (req, res, next) => {
    try {
      const qr = await qrService.getById(req.params.id);
      const svgString = await qrService.getStickerSVG(qr);
      const sharp = require('sharp');
      const pngBuffer = await sharp(Buffer.from(svgString)).png().toBuffer();
      
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="${qr.code}.png"`);
      res.send(pngBuffer);
    } catch (error) { next(error); }
  },

  /**
   * GET /api/qr/download/:id/svg — Download sticker QR as SVG
   */
  downloadSvg: async (req, res, next) => {
    try {
      const qr = await qrService.getById(req.params.id);
      const svgString = await qrService.getStickerSVG(qr);
      
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Content-Disposition', `attachment; filename="${qr.code}.svg"`);
      res.send(svgString);
    } catch (error) { next(error); }
  },

  /**
   * GET /api/qr/download/:id/pdf — Download sticker QR as PDF
   */
  downloadPdf: async (req, res, next) => {
    try {
      const qr = await qrService.getById(req.params.id);
      const pdfBuffer = await qrService.generatePdf(qr);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${qr.code}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) { next(error); }
  },
};

module.exports = qrController;
