const express = require('express');
const router = express.Router();

// Auth routes
router.use('/auth', require('./auth.routes'));

// Customer routes
router.use('/customer', require('./customer.routes'));

// Cleaner routes
router.use('/cleaner', require('./cleaner.routes'));

// Admin routes
router.use('/admin', require('./admin.routes'));

// Supervisor routes
router.use('/supervisor', require('./supervisor.routes'));

// Franchise routes
router.use('/franchise', require('./franchise.routes'));

// Shared resource routes
router.use('/tasks', require('./task.routes'));
router.use('/attendance', require('./attendance.routes'));
router.use('/leave', require('./leave.routes'));
router.use('/earnings', require('./earnings.routes'));
router.use('/incentives', require('./incentive.routes'));
router.use('/payments', require('./payment.routes'));
router.use('/subscriptions', require('./subscription.routes'));
router.use('/qr', require('./qr.routes'));
router.use('/issues', require('./issue.routes'));
router.use('/notifications', require('./notification.routes'));
router.use('/training', require('./training.routes'));
router.use('/performance', require('./performance.routes'));
router.use('/documents', require('./document.routes'));
router.use('/bookings', require('./booking.routes'));
router.use('/services', require('./service-marketplace.routes'));
router.use('/fasttag', require('./fasttag.routes'));
router.use('/offers', require('./offer.routes'));
router.use('/complaints', require('./complaint.routes'));
router.use('/chat', require('./chat.routes'));
router.use('/search', require('./search.routes'));
router.use('/upload', require('./upload.routes'));
router.use('/apartments', require('./apartment.routes'));
router.use('/vehicles', require('./vehicle.routes'));

// Lead / NCSP routes
router.use('/leads', require('./lead.routes'));
router.use('/ncsp', require('./ncsp.routes'));

// Invoice routes
router.use('/invoices', require('./invoice.routes'));

// Wallet, tracking, push routes
router.use('/wallet', require('./wallet.routes'));
router.use('/tracking', require('./tracking.routes'));
router.use('/push', require('./push.routes'));

router.use('/analytics', require('./analytics.routes'));

// CMS routes
router.use('/cms', require('./cms.routes'));

// Campaign routes
router.use('/campaigns', require('./campaign.routes'));

// Dashboard routes
router.use('/dashboard', require('./dashboard.routes'));

// Zone routes
router.use('/zones', require('./zone.routes'));

// Report routes
router.use('/reports', require('./report.routes'));

// Settings routes (admin only — protected in the route file itself)
router.use('/settings', require('./settings.routes'));

module.exports = router;
