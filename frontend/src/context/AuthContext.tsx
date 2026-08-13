import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  demoAccounts: User[];
  loginAsDemoUser: (user: User) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [demoAccounts, setDemoAccounts] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      try {
        const accounts = await api.getDemoAccounts();
        setDemoAccounts(accounts);

        if (token) {
          try {
            const current = await api.getCurrentUser();
            setUser(current.user);
          } catch {
            localStorage.removeItem('token');
            setToken(null);
            // Default to Admin demo user if no token
            if (accounts.length > 0) {
              await loginAsDemoUser(accounts[0]);
            }
          }
        } else if (accounts.length > 0) {
          // Default start logged in as Admin for easy demo exploration
          await loginAsDemoUser(accounts[0]);
        }
      } catch (err) {
        console.error('Failed to initialize auth context', err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const loginAsDemoUser = async (targetUser: User) => {
    try {
      const res = await api.login(targetUser.email, 'password123');
      localStorage.setItem('token', res.token);
      setToken(res.token);
      setUser(res.user);
    } catch (err) {
      console.error('Failed to login as demo user', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, demoAccounts, loginAsDemoUser, logout, loading }}>
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
