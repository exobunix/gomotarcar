const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { authorize, roles } = require('../middleware/roleGuard');
const { validate } = require('../middleware/validate');
const cmsController = require('../controllers/cms.controller');
const { uploadImage } = require('../middleware/upload');

// Banners
router.get('/banners', cmsController.getBanners);
router.get('/banners/:id', cmsController.getBannerById);
router.post('/banners', authenticate, authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), uploadImage.single('image'), cmsController.createBanner);
router.put('/banners/:id', authenticate, authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), uploadImage.single('image'), cmsController.updateBanner);
router.delete('/banners/:id', authenticate, authorize(roles.SUPER_ADMIN, roles.MANAGER), cmsController.deleteBanner);

// Blogs
router.get('/blogs', cmsController.getBlogs);
router.get('/blogs/:slug', cmsController.getBlogBySlug);
router.get('/blogs/:id', cmsController.getBlogById);
router.post('/blogs', authenticate, authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), uploadImage.single('image'), cmsController.createBlog);
router.put('/blogs/:id', authenticate, authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), uploadImage.single('image'), cmsController.updateBlog);
router.delete('/blogs/:id', authenticate, authorize(roles.SUPER_ADMIN, roles.MANAGER), cmsController.deleteBlog);

// FAQs
router.get('/faqs', cmsController.getFAQs);
router.get('/faqs/:id', cmsController.getFAQById);
router.post('/faqs', authenticate, authorize(roles.SUPER_ADMIN, roles.MANAGER), cmsController.createFAQ);
router.put('/faqs/:id', authenticate, authorize(roles.SUPER_ADMIN, roles.MANAGER), cmsController.updateFAQ);
router.delete('/faqs/:id', authenticate, authorize(roles.SUPER_ADMIN, roles.MANAGER), cmsController.deleteFAQ);

// Policies
router.get('/policies', cmsController.getPolicies);
router.get('/policies/:type', cmsController.getPolicyByType);
router.post('/policies', authenticate, authorize(roles.SUPER_ADMIN, roles.MANAGER), cmsController.createPolicy);
router.put('/policies/:id', authenticate, authorize(roles.SUPER_ADMIN, roles.MANAGER), cmsController.updatePolicy);

// Contact Requests
router.get('/contact-requests', authenticate, authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), cmsController.getContactRequests);
router.get('/contact-requests/:id', authenticate, authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), cmsController.getContactRequestById);
router.post('/contact-requests', cmsController.createContactRequest);
router.patch('/contact-requests/:id/status', authenticate, authorize(roles.SUPER_ADMIN, roles.MANAGER, roles.OPERATIONS), cmsController.updateContactRequestStatus);

// Download Links
router.get('/download-links', cmsController.getDownloadLinks);
router.get('/download-links/:platform', cmsController.getDownloadLinkByPlatform);
router.post('/download-links', authenticate, authorize(roles.SUPER_ADMIN, roles.MANAGER), cmsController.createDownloadLink);
router.put('/download-links/:id', authenticate, authorize(roles.SUPER_ADMIN, roles.MANAGER), cmsController.updateDownloadLink);
router.delete('/download-links/:id', authenticate, authorize(roles.SUPER_ADMIN, roles.MANAGER), cmsController.deleteDownloadLink);

module.exports = router;
