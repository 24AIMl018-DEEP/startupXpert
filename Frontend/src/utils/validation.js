// Custom JS validation utilities for onboarding and user profile inputs.
// Replaces default native browser HTML5 alerts with styled warnings.

export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return 'Email address is required.';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address (e.g. founder@venture.com).';
  }
  return '';
};

export const validateRequired = (value, fieldName = 'Field') => {
  if (value === undefined || value === null) {
    return `${fieldName} is required.`;
  }
  if (typeof value === 'string' && !value.trim()) {
    return `${fieldName} is required.`;
  }
  if (Array.isArray(value) && value.length === 0) {
    return `Please select at least one option for ${fieldName}.`;
  }
  return '';
};

export const validateFunding = (fundingRange) => {
  if (!fundingRange) {
    return 'Please select your current available funding range.';
  }
  const allowedRanges = ['Bootstrapped', '<₹1L', '₹1L-10L', '₹10L-1Cr', 'VC Funded'];
  if (!allowedRanges.includes(fundingRange)) {
    return 'Invalid funding index chosen.';
  }
  return '';
};

export const validateRevenueFormat = (revenue) => {
  if (!revenue || !revenue.trim()) {
    return 'Estimated Pricing / Revenue target is required.';
  }
  // Matches e.g. "₹499/month", "$19/user/month", "Free", "$250/year"
  const revRegex = /^[\u20B9$€£\d]+[a-zA-Z0-9\s\/\-\.]*$/;
  if (!revRegex.test(revenue.trim())) {
    return 'Revenue format must include currency symbol and rate (e.g. ₹499/month, $10/user).';
  }
  return '';
};

export const validateCharLimits = (text, fieldName = 'Text', min = 5, max = 500) => {
  if (!text || !text.trim()) {
    return `${fieldName} is required.`;
  }
  if (text.trim().length < min) {
    return `${fieldName} must be at least ${min} characters long to build reliable AI models.`;
  }
  if (text.trim().length > max) {
    return `${fieldName} cannot exceed ${max} characters limit.`;
  }
  return '';
};

export const validateDropdown = (value, allowedOptions = [], fieldName = 'Dropdown') => {
  if (!value) {
    return `Please select a valid option for ${fieldName}.`;
  }
  if (allowedOptions.length > 0 && !allowedOptions.includes(value)) {
    return `Invalid option chosen for ${fieldName}.`;
  }
  return '';
};

export const validateNumeric = (value, fieldName = 'Value') => {
  if (!value || !value.toString().trim()) {
    return `${fieldName} is required.`;
  }
  const num = Number(value);
  if (isNaN(num) || num <= 0) {
    return `${fieldName} must be a valid positive number.`;
  }
  return '';
};
