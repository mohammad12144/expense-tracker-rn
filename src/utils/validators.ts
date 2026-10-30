export type FieldError = string | null;

export const validateRequired =
  (label: string) =>
  (value: string): FieldError =>
    value.trim() ? null : `${label} is required`;

export const validateEmail = (value: string): FieldError => {
  if (!value.trim()) return 'Email is required';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? null : 'Enter a valid email';
};

export const validatePassword = (value: string): FieldError => {
  if (!value) return 'Password is required';
  if (value.length < 8) return 'Use at least 8 characters';
  if (!/\d/.test(value) || !/[A-Za-z]/.test(value)) return 'Use letters and numbers';
  return null;
};

export const validateName = (value: string): FieldError => {
  if (!value.trim()) return 'Name is required';
  return value.trim().length < 2 ? 'Name is too short' : null;
};

export const validateConfirm =
  (getPassword: () => string) =>
  (value: string): FieldError => {
    if (!value) return 'Please confirm your password';
    return value === getPassword() ? null : 'Passwords do not match';
  };