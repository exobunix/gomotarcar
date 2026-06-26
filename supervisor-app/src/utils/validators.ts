export const isValidPhone = (phone: string): boolean => {
  return /^[6-9]\d{9}$/.test(phone.replace(/\+91/, ''));
};

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidPincode = (pincode: string): boolean => {
  return /^\d{6}$/.test(pincode);
};

export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};

export const isValidName = (name: string): boolean => {
  return name.trim().length >= 2;
};

export const isValidAmount = (amount: string): boolean => {
  return /^\d+(\.\d{1,2})?$/.test(amount) && parseFloat(amount) > 0;
};

export const isValidPositiveInt = (value: string): boolean => {
  return /^\d+$/.test(value) && parseInt(value) > 0;
};
