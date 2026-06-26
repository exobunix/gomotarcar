const Banner = require('../models/Banner');
const Blog = require('../models/Blog');
const FAQ = require('../models/FAQ');
const Policy = require('../models/Policy');
const ContactRequest = require('../models/ContactRequest');
const DownloadLink = require('../models/DownloadLink');

// ========== Banners ==========
const getBanners = async (filters = {}) => {
  const query = {};
  if (filters.isActive !== undefined) query.isActive = filters.isActive;
  const page = parseInt(filters.page) || 1;
  const limit = 20;
  const banners = await Banner.find(query).sort({ position: 1, createdAt: -1 }).skip((page - 1) * limit).limit(limit);
  const total = await Banner.countDocuments(query);
  return { items: banners, page, limit, total, totalPages: Math.ceil(total / limit) };
};

const getBannerById = async (id) => Banner.findById(id);
const createBanner = async (data) => Banner.create(data);
const updateBanner = async (id, data) => Banner.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
const deleteBanner = async (id) => Banner.findByIdAndDelete(id);

// ========== Blogs ==========
const getBlogs = async (filters = {}) => {
  const query = {};
  if (filters.category) query.category = filters.category;
  if (filters.status) query.status = filters.status;
  const page = parseInt(filters.page) || 1;
  const limit = 20;
  const blogs = await Blog.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('createdBy', 'name');
  const total = await Blog.countDocuments(query);
  return { items: blogs, page, limit, total, totalPages: Math.ceil(total / limit) };
};

const getBlogBySlug = async (slug) => Blog.findOne({ slug }).populate('createdBy', 'name');
const getBlogById = async (id) => Blog.findById(id).populate('createdBy', 'name');
const createBlog = async (data) => Blog.create(data);
const updateBlog = async (id, data) => Blog.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
const deleteBlog = async (id) => Blog.findByIdAndDelete(id);

// ========== FAQs ==========
const getFAQs = async (filters = {}) => {
  const query = {};
  if (filters.category) query.category = filters.category;
  if (filters.isActive !== undefined) query.isActive = filters.isActive;
  return FAQ.find(query).sort({ position: 1, createdAt: -1 });
};

const getFAQById = async (id) => FAQ.findById(id);
const createFAQ = async (data) => FAQ.create(data);
const updateFAQ = async (id, data) => FAQ.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
const deleteFAQ = async (id) => FAQ.findByIdAndDelete(id);

// ========== Policies ==========
const getPolicies = async (filters = {}) => {
  const query = {};
  if (filters.isActive !== undefined) query.isActive = filters.isActive;
  return Policy.find(query).sort({ type: 1 });
};

const getPolicyByType = async (type) => Policy.findOne({ type, isActive: true });
const createPolicy = async (data) => Policy.create(data);
const updatePolicy = async (id, data) => Policy.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });

// ========== Contact Requests ==========
const getContactRequests = async (filters = {}) => {
  const query = {};
  if (filters.status) query.status = filters.status;
  const page = parseInt(filters.page) || 1;
  const limit = 20;
  const requests = await ContactRequest.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
  const total = await ContactRequest.countDocuments(query);
  return { items: requests, page, limit, total, totalPages: Math.ceil(total / limit) };
};

const getContactRequestById = async (id) => ContactRequest.findById(id);
const createContactRequest = async (data) => ContactRequest.create(data);
const updateContactRequestStatus = async (id, status) => ContactRequest.findByIdAndUpdate(id, { $set: { status } }, { new: true });

// ========== Download Links ==========
const getDownloadLinks = async () => DownloadLink.find().sort({ platform: 1 });
const getDownloadLinkByPlatform = async (platform) => DownloadLink.findOne({ platform, isActive: true });
const createDownloadLink = async (data) => DownloadLink.create(data);
const updateDownloadLink = async (id, data) => DownloadLink.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
const deleteDownloadLink = async (id) => DownloadLink.findByIdAndDelete(id);

module.exports = {
  getBanners, getBannerById, createBanner, updateBanner, deleteBanner,
  getBlogs, getBlogBySlug, getBlogById, createBlog, updateBlog, deleteBlog,
  getFAQs, getFAQById, createFAQ, updateFAQ, deleteFAQ,
  getPolicies, getPolicyByType, createPolicy, updatePolicy,
  getContactRequests, getContactRequestById, createContactRequest, updateContactRequestStatus,
  getDownloadLinks, getDownloadLinkByPlatform, createDownloadLink, updateDownloadLink, deleteDownloadLink
};
