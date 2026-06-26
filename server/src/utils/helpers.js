const { v4: uuidv4 } = require('uuid');
const dayjs = require('dayjs');

const generateId = (prefix) => {
  const date = dayjs().format('YYYYMMDD');
  const unique = uuidv4().slice(0, 8).toUpperCase();
  return `${prefix}-${date}-${unique}`;
};

const generateTaskId = () => generateId('TSK');
const generateIssueId = () => generateId('ISS');
const generateComplaintId = () => generateId('CMP');
const generatePayoutId = () => generateId('PAYOUT');
const generateBookingId = () => generateId('BKG');
const generateCleanerId = (sequence) => `GMC-${String(sequence).padStart(4, '0')}`;

const maskString = (str, start = 4, end = -4) => {
  if (!str) return '';
  if (str.length <= start + Math.abs(end)) return str;
  const visibleStart = str.slice(0, start);
  const visibleEnd = str.slice(end);
  const masked = '*'.repeat(str.length - start - Math.abs(end));
  return `${visibleStart}${masked}${visibleEnd}`;
};

const maskAadhaar = (aadhaar) => `${'*'.repeat(8)}${aadhaar?.slice(-4) || ''}`;
const maskPhone = (phone) => phone ? `${phone.slice(0, 2)}${'*'.repeat(5)}${phone.slice(-4)}` : '';
const maskAccount = (acc) => `XXXX${acc?.slice(-4) || ''}`;

const calculateWorkingHours = (checkIn, checkOut) => {
  const diffMs = new Date(checkOut) - new Date(checkIn);
  return Math.round(diffMs / (1000 * 60)); // in minutes
};

const calculateAttendancePercentage = (present, halfDays, lateDays, total) => {
  if (!total) return 0;
  const weightedPresent = present + halfDays * 0.5 + lateDays * 0.75;
  return Math.round((weightedPresent / total) * 100);
};

const getStartOfDay = (date = new Date()) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

const getEndOfDay = (date = new Date()) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
};

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

module.exports = {
  generateTaskId,
  generateIssueId,
  generateComplaintId,
  generatePayoutId,
  generateBookingId,
  generateCleanerId,
  maskString,
  maskAadhaar,
  maskPhone,
  maskAccount,
  calculateWorkingHours,
  calculateAttendancePercentage,
  getStartOfDay,
  getEndOfDay,
  generateOTP,
};
