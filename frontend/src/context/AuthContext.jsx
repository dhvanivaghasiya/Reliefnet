import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load current user if tokens exist
  useEffect(() => {
    const loadUser = async () => {
      const token = sessionStorage.getItem('access_token');
      if (token) {
        try {
          const res = await API.get('auth/me/');
          setUser(res.data);
        } catch (err) {
          console.error("Failed to load user:", err);
          // Standard cleanup
          sessionStorage.removeItem('access_token');
          sessionStorage.removeItem('refresh_token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (username, password) => {
    try {
      const res = await API.post('auth/login/', { username, password });
      const { access, refresh, user: userData } = res.data;
      sessionStorage.setItem('access_token', access);
      sessionStorage.setItem('refresh_token', refresh);
      setUser(userData);
      return { success: true };
    } catch (err) {
      let errorMsg = "Invalid credentials. Please try again.";
      if (!err.response) {
        errorMsg = "Unable to connect to the backend server. Please ensure the Django server is running on http://localhost:8000/";
      } else if (err.response.data?.detail) {
        errorMsg = err.response.data.detail;
      }
      return {
        success: false,
        error: errorMsg
      };
    }
  };

  const logout = async () => {
    const refresh = sessionStorage.getItem('refresh_token');
    if (refresh) {
      try {
        await API.post('auth/logout/', { refresh });
      } catch (err) {
        console.error("Logout failed on server:", err);
      }
    }
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    setUser(null);
  };

  const registerLeader = async (leaderData) => {
    try {
      await API.post('auth/register/leader/', leaderData);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data || { detail: "Registration failed." }
      };
    }
  };

  const registerVolunteer = async (volunteerData) => {
    try {
      await API.post('auth/register/volunteer/', volunteerData);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data || { detail: "Registration failed." }
      };
    }
  };

  const changePassword = async (newPassword) => {
    try {
      await API.post('auth/change-password/', { new_password: newPassword });
      setUser(prev => prev ? { ...prev, must_change_password: false } : null);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.detail || "Failed to update password."
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, registerLeader, registerVolunteer, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
