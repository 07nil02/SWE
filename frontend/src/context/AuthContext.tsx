import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, AuthUser, UserRole, getAuthToken, setAuthToken } from '../api/client';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  role: UserRole | null;
  isAdmin: boolean;
  isCustomer: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    phone?: string;
    drivingLicense?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  demoLogin: (role: UserRole) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = getAuthToken();
      if (storedToken) {
        try {
          const currentUser = await api.getMe();
          if (currentUser) {
            setUser(currentUser);
            setTokenState(storedToken);
          } else {
            setAuthToken(null);
            setTokenState(null);
            setUser(null);
          }
        } catch {
          setAuthToken(null);
          setTokenState(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.login({ email, password });
      const user = res.data?.user || res.user;
      const token = res.data?.token || res.token;
      if (res.success && user && token) {
        setAuthToken(token);
        setTokenState(token);
        setUser(user);
        return { success: true, message: res.message || 'Signed in successfully' };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error during login' };
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    phone?: string;
    drivingLicense?: string;
  }) => {
    try {
      const res = await api.register(data);
      const user = res.data?.user || res.user;
      const token = res.data?.token || res.token;
      if (res.success && user && token) {
        setAuthToken(token);
        setTokenState(token);
        setUser(user);
        return { success: true, message: res.message || 'Registered successfully' };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error during registration' };
    }
  };

  const demoLogin = async (role: UserRole) => {
    try {
      const res = await api.demoLogin(role);
      const user = res.data?.user || res.user;
      const token = res.data?.token || res.token;
      if (res.success && user && token) {
        setAuthToken(token);
        setTokenState(token);
        setUser(user);
        return { success: true, message: res.message || `Demo access granted as ${role}` };
      }
      return { success: false, message: res.message || 'Demo login failed' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error during demo login' };
    }
  };

  const logout = () => {
    setAuthToken(null);
    setTokenState(null);
    setUser(null);
  };

  const role = user?.role || null;
  const isAdmin = role === 'ADMIN';
  const isCustomer = role === 'CUSTOMER';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        isAdmin,
        isCustomer,
        isAuthenticated,
        isLoading,
        login,
        register,
        demoLogin,
        logout,
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
