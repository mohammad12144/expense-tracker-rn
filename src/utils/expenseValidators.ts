import { FieldError } from './validators';

export const validateAmount = (value: string): FieldError => {
  const n = Number(value);
  return value.trim() && Number.isFinite(n) && n > 0 ? null : 'Enter an amount greater than 0';
};

export const validateDate = (value: string): FieldError => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'Use the format YYYY-MM-DD';
  const d = new Date(`${value}T00:00:00Z`);
  const valid = !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
  return valid ? null : 'Enter a valid date';
};