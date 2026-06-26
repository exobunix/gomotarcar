const cmsService = require('../services/cms.service');
const logger = require('../utils/logger');

// ========== Banners ==========
const getBanners = async (req, res) => {
  try {
    const { page, isActive } = req.query;
    const result = await cmsService.getBanners({ page, isActive });
    res.json({ success: true, data: result });
  } catch (err) {
    logger.error('CMS getBanners error:', err);
    res.status(500).json({ success: false, error: { code: 'CMS_ERROR', message: err.message } });
  }
};

const getBannerById = async (req, res) => {
  try {
    const banner = await cmsService.getBannerById(req.params.id);
    if (!banner) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Banner not found' } });
    res.json({ success: true, data: banner });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'CMS_ERROR', message: err.message } });
  }
};

const createBanner = async (req, res) => {
  try {
    const banner = await cmsService.createBanner({ ...req.body, image: req.file?.path, createdBy: req.user._id });
    res.status(201).json({ success: true, data: banner });
  } catch (err) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.message } });
  }
};

const updateBanner = async (req, res) => {
  try {
    const banner = await cmsService.updateBanner(req.params.id, { ...req.body, image: req.file?.path });
    if (!banner) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Banner not found' } });
    res.json({ success: true, data: banner });
  } catch (err) {
    res.status(400).json({ success: false, error: { code: 'UPDATE_ERROR', message: err.message } });
  }
};

const deleteBanner = async (req, res) => {
  try {
    const banner = await cmsService.deleteBanner(req.params.id);
    if (!banner) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Banner not found' } });
    res.json({ success: true, data: { message: 'Banner deleted successfully' } });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DELETE_ERROR', message: err.message } });
  }
};

// ========== Blogs ==========
const getBlogs = async (req, res) => {
  try {
    const { page, category, status } = req.query;
    const result = await cmsService.getBlogs({ page, category, status });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'CMS_ERROR', message: err.message } });
  }
};

const getBlogBySlug = async (req, res) => {
  try {
    const blog = await cmsService.getBlogBySlug(req.params.slug);
    if (!blog) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Blog not found' } });
    res.json({ success: true, data: blog });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'CMS_ERROR', message: err.message } });
  }
};

const getBlogById = async (req, res) => {
  try {
    const blog = await cmsService.getBlogById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Blog not found' } });
    res.json({ success: true, data: blog });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'CMS_ERROR', message: err.message } });
  }
};

const createBlog = async (req, res) => {
  try {
    const blog = await cmsService.createBlog({ ...req.body, image: req.file?.path, createdBy: req.user._id });
    res.status(201).json({ success: true, data: blog });
  } catch (err) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.message } });
  }
};

const updateBlog = async (req, res) => {
  try {
    const blog = await cmsService.updateBlog(req.params.id, { ...req.body, image: req.file?.path });
    if (!blog) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Blog not found' } });
    res.json({ success: true, data: blog });
  } catch (err) {
    res.status(400).json({ success: false, error: { code: 'UPDATE_ERROR', message: err.message } });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const blog = await cmsService.deleteBlog(req.params.id);
    if (!blog) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Blog not found' } });
    res.json({ success: true, data: { message: 'Blog deleted successfully' } });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DELETE_ERROR', message: err.message } });
  }
};

// ========== FAQs ==========
const getFAQs = async (req, res) => {
  try {
    const { category, isActive } = req.query;
    const result = await cmsService.getFAQs({ category, isActive });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'CMS_ERROR', message: err.message } });
  }
};

const getFAQById = async (req, res) => {
  try {
    const faq = await cmsService.getFAQById(req.params.id);
    if (!faq) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'FAQ not found' } });
    res.json({ success: true, data: faq });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'CMS_ERROR', message: err.message } });
  }
};

const createFAQ = async (req, res) => {
  try {
    const faq = await cmsService.createFAQ({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: faq });
  } catch (err) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.message } });
  }
};

const updateFAQ = async (req, res) => {
  try {
    const faq = await cmsService.updateFAQ(req.params.id, req.body);
    if (!faq) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'FAQ not found' } });
    res.json({ success: true, data: faq });
  } catch (err) {
    res.status(400).json({ success: false, error: { code: 'UPDATE_ERROR', message: err.message } });
  }
};

const deleteFAQ = async (req, res) => {
  try {
    const faq = await cmsService.deleteFAQ(req.params.id);
    if (!faq) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'FAQ not found' } });
    res.json({ success: true, data: { message: 'FAQ deleted successfully' } });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DELETE_ERROR', message: err.message } });
  }
};

// ========== Policies ==========
const getPolicies = async (req, res) => {
  try {
    const { isActive } = req.query;
    const result = await cmsService.getPolicies({ isActive });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'CMS_ERROR', message: err.message } });
  }
};

const getPolicyByType = async (req, res) => {
  try {
    const policy = await cmsService.getPolicyByType(req.params.type);
    if (!policy) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Policy not found' } });
    res.json({ success: true, data: policy });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'CMS_ERROR', message: err.message } });
  }
};

const createPolicy = async (req, res) => {
  try {
    const policy = await cmsService.createPolicy({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: policy });
  } catch (err) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.message } });
  }
};

const updatePolicy = async (req, res) => {
  try {
    const policy = await cmsService.updatePolicy(req.params.id, req.body);
    if (!policy) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Policy not found' } });
    res.json({ success: true, data: policy });
  } catch (err) {
    res.status(400).json({ success: false, error: { code: 'UPDATE_ERROR', message: err.message } });
  }
};

// ========== Contact Requests ==========
const getContactRequests = async (req, res) => {
  try {
    const { page, status } = req.query;
    const result = await cmsService.getContactRequests({ page, status });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'CMS_ERROR', message: err.message } });
  }
};

const getContactRequestById = async (req, res) => {
  try {
    const request = await cmsService.getContactRequestById(req.params.id);
    if (!request) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Contact request not found' } });
    res.json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'CMS_ERROR', message: err.message } });
  }
};

const createContactRequest = async (req, res) => {
  try {
    const request = await cmsService.createContactRequest(req.body);
    res.status(201).json({ success: true, data: request });
  } catch (err) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.message } });
  }
};

const updateContactRequestStatus = async (req, res) => {
  try {
    const request = await cmsService.updateContactRequestStatus(req.params.id, req.body.status);
    if (!request) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Contact request not found' } });
    res.json({ success: true, data: request });
  } catch (err) {
    res.status(400).json({ success: false, error: { code: 'UPDATE_ERROR', message: err.message } });
  }
};

// ========== Download Links ==========
const getDownloadLinks = async (req, res) => {
  try {
    const result = await cmsService.getDownloadLinks();
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'CMS_ERROR', message: err.message } });
  }
};

const getDownloadLinkByPlatform = async (req, res) => {
  try {
    const link = await cmsService.getDownloadLinkByPlatform(req.params.platform);
    if (!link) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Download link not found' } });
    res.json({ success: true, data: link });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'CMS_ERROR', message: err.message } });
  }
};

const createDownloadLink = async (req, res) => {
  try {
    const link = await cmsService.createDownloadLink(req.body);
    res.status(201).json({ success: true, data: link });
  } catch (err) {
    res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: err.message } });
  }
};

const updateDownloadLink = async (req, res) => {
  try {
    const link = await cmsService.updateDownloadLink(req.params.id, req.body);
    if (!link) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Download link not found' } });
    res.json({ success: true, data: link });
  } catch (err) {
    res.status(400).json({ success: false, error: { code: 'UPDATE_ERROR', message: err.message } });
  }
};

const deleteDownloadLink = async (req, res) => {
  try {
    const link = await cmsService.deleteDownloadLink(req.params.id);
    if (!link) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Download link not found' } });
    res.json({ success: true, data: { message: 'Download link deleted successfully' } });
  } catch (err) {
    res.status(500).json({ success: false, error: { code: 'DELETE_ERROR', message: err.message } });
  }
};

module.exports = {
  getBanners, getBannerById, createBanner, updateBanner, deleteBanner,
  getBlogs, getBlogBySlug, getBlogById, createBlog, updateBlog, deleteBlog,
  getFAQs, getFAQById, createFAQ, updateFAQ, deleteFAQ,
  getPolicies, getPolicyByType, createPolicy, updatePolicy,
  getContactRequests, getContactRequestById, createContactRequest, updateContactRequestStatus,
  getDownloadLinks, getDownloadLinkByPlatform, createDownloadLink, updateDownloadLink, deleteDownloadLink
};
