import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../api/auth';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  is_buyer: boolean;
  is_seller: boolean;
  rating: number;
  profile_picture?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: object) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in on app start
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        const { data } = await authAPI.getProfile();
        setUser(data);
      }
    } catch {
      await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const { data } = await authAPI.login({ username, password });
    await AsyncStorage.setItem('access_token', data.tokens.access);
    await AsyncStorage.setItem('refresh_token', data.tokens.refresh);
    setUser(data.user);
  };

  const register = async (payload: object) => {
    const { data } = await authAPI.register(payload as any);
    await AsyncStorage.setItem('access_token', data.tokens.access);
    await AsyncStorage.setItem('refresh_token', data.tokens.refresh);
    setUser(data.user);
  };

  const logout = async () => {
    try {
      const refresh = await AsyncStorage.getItem('refresh_token');
      if (refresh) await authAPI.logout(refresh);
    } finally {
      await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
      setUser(null);
    }
  };

  const refreshProfile = async () => {
    const { data } = await authAPI.getProfile();
    setUser(data);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
