// Global constants and configuration definitions for StartupXpert.

export const DOMAINS = [
  { value: 'HealthTech', label: 'HealthTech (Healthcare IT)' },
  { value: 'EdTech', label: 'EdTech (Education Services)' },
  { value: 'FinTech', label: 'FinTech (Financial Services)' },
  { value: 'AgriTech', label: 'AgriTech (Agricultural Engineering)' },
  { value: 'E-Commerce', label: 'E-Commerce (Retail & Delivery)' },
  { value: 'SaaS', label: 'SaaS (Software as a Service)' },
  { value: 'Other', label: 'Other Domain' }
];

export const REVENUE_MODELS = [
  { value: 'Subscription', label: 'Subscription (SaaS, Monthly/Yearly)' },
  { value: 'Freemium', label: 'Freemium (Free tier + paid features)' },
  { value: 'One-time', label: 'One-time License / Transactional fee' },
  { value: 'Commission', label: 'Commission / Marketplace take-rate' },
  { value: 'Ads', label: 'Advertising / Data Monetization' },
  { value: 'Other', label: 'Other Model' }
];

export const FUNDING_RANGES = [
  { value: 'Bootstrapped', label: 'Self-funded / Bootstrapped' },
  { value: '<₹1L', label: 'Seed budget (< ₹1 Lakh)' },
  { value: '₹1L-10L', label: 'Angel budget (₹1 Lakh - ₹10 Lakhs)' },
  { value: '₹10L-1Cr', label: 'Pre-seed budget (₹10 Lakhs - ₹1 Crore)' },
  { value: 'VC Funded', label: 'Institutional / VC Funded' }
];

export const SYSTEM_STEPS = [
  { id: 1, name: 'Profile & Role', description: 'Step 1' },
  { id: 2, name: 'Startup Details', description: 'Step 2' },
  { id: 3, name: 'Idea Validation', description: 'Step 3' }
];

export const ERROR_MESSAGES = {
  NETWORK_FAILED: 'Network connection failed. Please check your internet link and try again.',
  API_FAILED: 'We encountered an error communicating with our AI analyzers. Rerun the simulation.',
  SESSION_EXPIRED: 'Your session has timed out. Please login to restore your active workspace.',
  DRAFT_NOT_FOUND: 'We could not locate any saved onboarding progress draft in local storage.'
};
export default { DOMAINS, REVENUE_MODELS, FUNDING_RANGES, SYSTEM_STEPS, ERROR_MESSAGES };
