/**
 * User input validation utilities
 */

/**
 * Validate email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password (minimum 6 characters)
 */
export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

/**
 * Validate phone number (010-XXXX-XXXX format)
 */
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^010-\d{4}-\d{4}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate name (non-empty after trimming)
 */
export const validateName = (name: string): boolean => {
  return name.trim().length > 0;
};
