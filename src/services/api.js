import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

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
      ['token', 'username', 'role', 'role_id', 'role_name', 'permissions', 'menus', 'refresh_token']
        .forEach(k => localStorage.removeItem(k));
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
