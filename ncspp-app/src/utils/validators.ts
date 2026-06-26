export const isValidPhone = (phone: string): boolean => /^[6-9]\d{9}$/.test(phone.replace(/\+91/, ''));
export const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const isValidGst = (gst: string): boolean => /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst);
export const isValidPincode = (pincode: string): boolean => /^\d{6}$/.test(pincode);
export const isNotEmpty = (value: string): boolean => value.trim().length > 0;
export const isValidAmount = (amount: string): boolean => /^\d+(\.\d{1,2})?$/.test(amount) && parseFloat(amount) > 0;
