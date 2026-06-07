import axios from 'axios';

export const BASE_URL = '/api';

/**
 * Pre-configured axios instance that injects the JWT token on every request
 * and redirects to the login page on 401 responses.
 */
const api = axios.create({baseURL: BASE_URL});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export default api;
