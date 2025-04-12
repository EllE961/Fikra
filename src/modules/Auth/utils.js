// src/modules/Auth/utils.js
import validator from 'validator';
import zxcvbn from 'zxcvbn';

/**
 * Validates an email using validator.js.
 * @param {string} email
 * @returns {boolean} true if valid, false otherwise.
 */
export const isValidEmail = email => {
  return validator.isEmail(email);
};

/**
 * Checks if a password is strong using zxcvbn.
 * zxcvbn returns a score from 0 to 4; here we consider a score of 3 or more as strong.
 * @param {string} password
 * @returns {boolean} true if strong, false otherwise.
 */
export const isStrongPassword = password => {
  const result = zxcvbn(password);
  return result.score >= 3;
};

/**
 * Optionally, returns feedback about the password.
 * @param {string} password
 * @returns {object} feedback with warning and suggestions.
 */
export const getPasswordFeedback = password => {
  const result = zxcvbn(password);
  return result.feedback;
};
