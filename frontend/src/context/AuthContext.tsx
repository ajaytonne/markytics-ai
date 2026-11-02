import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { email: string; password: string; first_name: string; last_name: string; role: Role }) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isCandidate: boolean;
  isRecruiter: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const initCsrf = async () => {
    try {
      await api.get('/auth/csrf/');
    } catch (_err) {
      // ignore
    }
  };

  const refreshUser = async () => {
    try {
      setLoading(true);
      await initCsrf();
      const res = await api.get('/auth/me/');
      setUser(res.data);
      setError(null);
    } catch (_err) {
      setUser(null);
      localStorage.removeItem('session_id');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setError(null);
    setLoading(true);
    try {
      await initCsrf();
      const loginRes = await api.post('/auth/login/', { email, password });
      if (loginRes.data?.sessionId) {
        localStorage.setItem('session_id', loginRes.data.sessionId);
      }
      const meRes = await api.get('/auth/me/');
      setUser(meRes.data);
      return meRes.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: { email: string; password: string; first_name: string; last_name: string; role: Role }): Promise<User> => {
    setError(null);
    setLoading(true);
    try {
      await initCsrf();
      const regRes = await api.post('/auth/register/', data);
      if (regRes.data?.sessionId) {
        localStorage.setItem('session_id', regRes.data.sessionId);
      }
      const meRes = await api.get('/auth/me/');
      setUser(meRes.data);
      return meRes.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout/');
    } catch (_err) {
      // ignore
    } finally {
      setUser(null);
      localStorage.removeItem('session_id');
      setLoading(false);
    }
  };

  const isCandidate = user?.role === 'CANDIDATE';
  const isRecruiter = user?.role === 'RECRUITER';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        refreshUser,
        isCandidate,
        isRecruiter,
        isAdmin,
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
