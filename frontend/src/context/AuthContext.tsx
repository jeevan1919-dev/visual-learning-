import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  loginAsDemo: () => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('visuallearn_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const profile = await authService.getMe();
        setUser(profile);
      } catch (err) {
        console.warn('Initial session fetch notice:', err);
        // Fallback to local demo student session
        setUser({
          id: 'demo-student-001',
          email: 'student@visuallearn.ai',
          display_name: 'Demo Student',
          preferred_difficulty: 'intermediate',
          theme_preference: 'system',
        });
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, password);
      localStorage.setItem('visuallearn_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    try {
      const res = await authService.signup(email, password, name);
      localStorage.setItem('visuallearn_token', res.access_token);
      setToken(res.access_token);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = async () => {
    await login('demo@visuallearn.ai', 'demopassword123');
  };

  const logout = () => {
    localStorage.removeItem('visuallearn_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = async (data: Partial<UserProfile>) => {
    const updated = await authService.updateProfile(data);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        loginAsDemo,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
