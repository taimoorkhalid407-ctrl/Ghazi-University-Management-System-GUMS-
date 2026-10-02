import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useToast } from './ToastContext.tsx';

interface AuthContextType {
  currentUser: User | null;
  role: Role | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  demoLogin: (role: Role) => Promise<void>;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'gums_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.user && parsed.token) {
          setCurrentUser(parsed.user);
          setToken(parsed.token);
        }
      } else {
        // Default to admin for seamless evaluation if desired or start logged out
        // Let's check stored session
      }
    } catch (e) {
      console.error('Failed to parse auth session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await api.login(email, password);
      setCurrentUser(res.user);
      setToken(res.token);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ user: res.user, token: res.token }));
      showToast(`Welcome back, ${res.user.name}!`, 'success');
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials';
      showToast(msg, 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    showToast('You have been logged out successfully.', 'info');
  };

  const demoLogin = async (role: Role) => {
    if (role === 'admin') {
      await login('admin@gu.edu.pk', 'Admin@123');
    } else if (role === 'teacher') {
      await login('imran@gu.edu.pk', 'Teacher@123');
    } else if (role === 'student') {
      await login('abdullah@gu.edu.pk', 'Student@123');
    }
  };

  const role = currentUser?.role || null;
  const isAdmin = role === 'admin';
  const isTeacher = role === 'teacher';
  const isStudent = role === 'student';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        token,
        isLoading,
        login,
        logout,
        demoLogin,
        isAdmin,
        isTeacher,
        isStudent
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
