import axios from 'axios';

const api = axios.create({
  baseURL: 'https://judiciary-case-backlog-reduction-backend.onrender.com/api', // ✅ FIX
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor for handling auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // The backend auto-refreshes tokens via cookies in the auth middleware
        // Just retry the request
        return api(originalRequest);
      } catch (refreshError) {
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
