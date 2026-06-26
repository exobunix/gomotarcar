export const validators = {
  phone: (value: string): string | undefined => {
    if (!value) return 'Phone number is required';
    if (value.length < 10) return 'Phone number must be 10 digits';
    if (!/^[6-9]\d{9}$/.test(value)) return 'Invalid phone number';
    return undefined;
  },

  email: (value: string): string | undefined => {
    if (!value) return undefined; // Optional
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email address';
    return undefined;
  },

  password: (value: string): string | undefined => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return undefined;
  },

  required: (value: string, fieldName: string): string | undefined => {
    if (!value || !value.trim()) return `${fieldName} is required`;
    return undefined;
  },

  gst: (value: string): string | undefined => {
    if (!value) return undefined;
    if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value)) return 'Invalid GST number';
    return undefined;
  },

  pincode: (value: string): string | undefined => {
    if (!value) return undefined;
    if (!/^[1-9][0-9]{5}$/.test(value)) return 'Invalid pincode';
    return undefined;
  },
};
