import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const stored = {
        token,
        username:    localStorage.getItem('username')    || '',
        role:        localStorage.getItem('role')        || '',
        role_id:     localStorage.getItem('role_id')     ? Number(localStorage.getItem('role_id')) : null,
        role_name:   localStorage.getItem('role_name')   || '',
        permissions: JSON.parse(localStorage.getItem('permissions') || '{}'),
        menus:       JSON.parse(localStorage.getItem('menus')       || '[]'),
      };
      setUser(stored);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const {
      access_token, refresh_token,
      username: uname, role, role_id, role_name,
      permissions = {}, menus = [],
    } = response.data;

    localStorage.setItem('token',       access_token);
    localStorage.setItem('username',    uname);
    localStorage.setItem('role',        role);
    localStorage.setItem('role_id',     role_id ?? '');
    localStorage.setItem('role_name',   role_name ?? role);
    localStorage.setItem('permissions', JSON.stringify(permissions));
    localStorage.setItem('menus',       JSON.stringify(menus));
    if (refresh_token) localStorage.setItem('refresh_token', refresh_token);

    setUser({ token: access_token, username: uname, role, role_id, role_name, permissions, menus });
    return true;
  };

  const logout = () => {
    ['token', 'username', 'role', 'role_id', 'role_name', 'permissions', 'menus', 'refresh_token']
      .forEach(k => localStorage.removeItem(k));
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
