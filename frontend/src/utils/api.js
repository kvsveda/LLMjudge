// ============================================================
//  utils/api.js — Axios instance with JWT auto-injection
// ============================================================
import axios from 'axios';

const authBypassEnabled = process.env.REACT_APP_BYPASS_AUTH === 'true';
const apiBaseUrl = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api`
  : '/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000, // 2 min for slow LLM calls
});

// Inject token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('llmj_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!authBypassEnabled && error.response?.status === 401) {
      localStorage.removeItem('llmj_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
