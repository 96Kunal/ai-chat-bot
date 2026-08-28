import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string; major?: string; year?: string }) => Promise<void>;
  demoLogin: () => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User> & { customApiKey?: string }) => Promise<void>;
  setCustomApiKey: (key: string) => void;
  customApiKey: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [customApiKey, setCustomApiKeyState] = useState<string>(localStorage.getItem('gemini_api_key') || '');

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const userData = await authApi.getMe();
          setUser(userData);
        } catch {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const setCustomApiKey = (key: string) => {
    setCustomApiKeyState(key);
    if (key) {
      localStorage.setItem('gemini_api_key', key);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  };

  const login = async (data: { email: string; password: string }) => {
    const res = await authApi.login(data);
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const register = async (data: { name: string; email: string; password: string; major?: string; year?: string }) => {
    const res = await authApi.register(data);
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const demoLogin = async () => {
    const res = await authApi.demoLogin();
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data: Partial<User> & { customApiKey?: string }) => {
    const res = await authApi.updateProfile(data);
    setUser(res.user);
    if (data.customApiKey !== undefined) {
      setCustomApiKey(data.customApiKey);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        demoLogin,
        logout,
        updateProfile,
        setCustomApiKey,
        customApiKey,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
