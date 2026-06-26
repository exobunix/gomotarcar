export const formatPhone = (phone: string): string => {
  if (phone.length === 10) {
    return `${phone.slice(0, 5)} ${phone.slice(5)}`;
  }
  return phone;
};

export const maskPhone = (phone: string): string => {
  if (phone.length === 10) {
    return `${phone.slice(0, 3)}****${phone.slice(7)}`;
  }
  return phone;
};

export const formatDate = (date: string | Date, format: 'short' | 'long' | 'time' = 'short'): string => {
  const d = new Date(date);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: format === 'long' ? 'long' : 'short',
    year: 'numeric',
  };
  if (format === 'time') {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  return d.toLocaleDateString('en-IN', options);
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const FUEL_TYPE_LABELS: Record<string, string> = {
  petrol: 'Petrol',
  diesel: 'Diesel',
  electric: 'Electric',
  cng: 'CNG',
  hybrid: 'Hybrid',
};

export const VEHICLE_TYPE_LABELS: Record<string, string> = {
  hatchback: 'Hatchback',
  sedan: 'Sedan',
  suv: 'SUV',
  muv: 'MUV',
  pickup: 'Pickup',
  luxury: 'Luxury',
};
