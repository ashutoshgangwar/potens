/**
 * Simple form validation utilities
 */

export const validators = {
  required: (value) =>
    value && value.toString().trim().length > 0 ? '' : 'This field is required.',

  email: (value) => {
    if (!value) return 'Email is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? '' : 'Enter a valid email address.';
  },

  phone: (value) => {
    if (!value) return 'Phone number is required.';
    const normalizedValue = value.replace(/\D/g, '');
    if (normalizedValue.length !== 10) return 'Enter a valid 10-digit phone number.';
    return '';
  },

  minLength: (min) => (value) => {
    if (!value) return `Minimum ${min} characters required.`;
    return value.length >= min ? '' : `Must be at least ${min} characters.`;
  },

  maxLength: (max) => (value) => {
    if (!value) return '';
    return value.length <= max ? '' : `Must be no more than ${max} characters.`;
  },

  password: (value) => {
    if (!value) return 'Password is required.';
    if (value.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter.';
    if (!/[0-9]/.test(value)) return 'Password must contain at least one number.';
    return '';
  },

  confirmPassword: (original) => (value) => {
    if (!value) return 'Please confirm your password.';
    return value === original ? '' : 'Passwords do not match.';
  },

  name: (value) => {
    if (!value || !value.trim()) return 'Name is required.';
    if (value.trim().length < 2) return 'Name must be at least 2 characters.';
    return '';
  },
};

/**
 * Validate a form field with multiple validators
 * @param {*} value - field value
 * @param {Array<Function>} rules - array of validator functions
 * @returns {string} - first error message or empty string
 */
export const validateField = (value, rules = []) => {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
  return '';
};
