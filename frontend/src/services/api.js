import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
API.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refresh = sessionStorage.getItem('refresh_token');
        if (refresh) {
          const res = await axios.post('http://localhost:8000/api/auth/token/refresh/', { refresh });
          if (res.status === 200) {
            sessionStorage.setItem('access_token', res.data.access);
            originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
            return API(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh token expired or invalid, clean up session storage
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('refresh_token');
        // Let the application handles redirect/state update
      }
    }
    return Promise.reject(error);
  }
);

export default API;
