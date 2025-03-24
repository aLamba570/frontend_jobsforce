// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  axios.defaults.baseURL = 'http://localhost:3000/api';
  
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  const login = async (email, password) => {
    const res = await axios.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setCurrentUser(res.data.user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    }
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await axios.post('/auth/register', { name, email, password });
    if (res.data.success) {
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setCurrentUser(res.data.user);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  const loadUser = async () => {
    setLoading(true);
    try {
      if (token) {
        const res = await axios.get('/auth/me');
        setCurrentUser(res.data);
      }
    } catch (err) {
      localStorage.removeItem('token');
      setToken(null);
      delete axios.defaults.headers.common['Authorization'];
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, [token]);

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      loading, 
      login, 
      register, 
      logout,
      loadUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};