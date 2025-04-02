import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

// Create an axios instance with the base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  withCredentials: true
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authMessage, setAuthMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { data } = await api.get('/api/auth/check-auth');
      setUser(data.user);
      setAuthMessage(data.message || 'Authenticated');
    } catch (err) {
      console.log('Auth check error:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const { data } = await api.post('/api/auth/login', credentials);
      setUser(data.user);
      setAuthMessage(data.message || 'Login successful');
      navigate('/dashboard');
      return data;
    } catch (err) {
      console.error('Login error:', err);
      throw err.response?.data || { message: 'Login failed' };
    }
  };

  const register = async (credentials) => {
    try {
      const { data } = await api.post('/api/auth/register', credentials);
      setUser(data.user);
      setAuthMessage(data.message || 'Registration successful');
      navigate('/dashboard');
      return data;
    } catch (err) {
      console.error('Register error:', err);
      throw err.response?.data || { message: 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
      setUser(null);
      setAuthMessage('Logged out successfully');
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      register, 
      authMessage,
      setAuthMessage,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isVerified: user?.verified || user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);