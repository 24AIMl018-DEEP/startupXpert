// Generic API client simulator with promise delays and conditional network error triggers.
export const api = {
  get: (url, delay = 1000) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Trigger simulated network error roughly 10% of the time to demonstrate error states
        if (Math.random() < 0.1) {
          reject(new Error('Network connection failed. Server is unreachable.'));
        } else {
          resolve({ status: 200, data: {} });
        }
      }, delay);
    });
  },

  post: (url, body, delay = 1200) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < 0.1) {
          reject(new Error('API request failed due to transaction timeout.'));
        } else {
          resolve({ status: 201, data: body });
        }
      }, delay);
    });
  },

  put: (url, body, delay = 1000) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < 0.1) {
          reject(new Error('Server failed to update the requested resource.'));
        } else {
          resolve({ status: 200, data: body });
        }
      }, delay);
    });
  },

  delete: (url, delay = 800) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < 0.1) {
          reject(new Error('Failed to complete delete transaction.'));
        } else {
          resolve({ status: 200, message: 'Resource deleted successfully' });
        }
      }, delay);
    });
  }
};
