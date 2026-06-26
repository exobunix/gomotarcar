export const isValidPhone = (phone: string): boolean => {
  return /^[6-9]\d{9}$/.test(phone);
};

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidOTP = (otp: string): boolean => {
  return /^\d{4,6}$/.test(otp);
};

export const isValidPincode = (pincode: string): boolean => {
  return /^\d{6}$/.test(pincode);
};

export const isValidVehicleNumber = (number: string): boolean => {
  return /^[A-Z]{2}\s?\d{1,2}\s?[A-Z]{1,3}\s?\d{1,4}$/.test(number.toUpperCase());
};

export const isValidName = (name: string): boolean => {
  return name.trim().length >= 2 && name.trim().length <= 50;
};
