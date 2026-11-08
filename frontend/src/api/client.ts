import axios from 'axios';

// When deployed on cloud platforms like Render, VITE_API_BASE_URL can point to the backend URL
// (e.g. https://airesearch-backend.onrender.com). In local dev or reverse proxy, it defaults to relative '/api/v1'.
let rawBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || '';
if (rawBase && !rawBase.startsWith('http://') && !rawBase.startsWith('https://')) {
  rawBase = `https://${rawBase}`;
}
const trimmedBase = rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;
const API_BASE_URL = `${trimmedBase}/api/v1`;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or unauthorized
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
