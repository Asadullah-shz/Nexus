import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole, AuthContextType } from '../types';
import { users, saveUsers } from '../data/users';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'business_nexus_user';
const RESET_TOKEN_KEY = 'business_nexus_reset_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, _password: string, role: UserRole): Promise<void> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const foundUser = users.find(u => u.email === email && u.role === role);
      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(foundUser));
        toast.success('Successfully logged in!');
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, _password: string, role: UserRole): Promise<void> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      if (users.some(u => u.email === email)) {
        throw new Error('Email already in use');
      }

      const newUser: User = {
        id: `${role[0]}${Date.now()}`,
        name,
        email,
        role,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        bio: '',
        isOnline: true,
        createdAt: new Date().toISOString()
      };

      users.push(newUser as any);
      saveUsers();
      
      setUser(newUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      toast.success('Account created successfully!');
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<void> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const user = users.find(u => u.email === email);
      if (!user) throw new Error('Account not found');
      
      const resetToken = Math.random().toString(36).substring(2, 15);
      localStorage.setItem(RESET_TOKEN_KEY, resetToken);
      toast.success('Instructions sent to your email');
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  };

  const resetPassword = async (token: string, _newPassword: string): Promise<void> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const storedToken = localStorage.getItem(RESET_TOKEN_KEY);
      if (token !== storedToken) throw new Error('Invalid token');
      
      localStorage.removeItem(RESET_TOKEN_KEY);
      toast.success('Password changed');
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  };

  const logout = (): void => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    toast.success('Logged out');
  };

  const updateProfile = async (userId: string, updates: Partial<User>): Promise<void> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) throw new Error('User not found');
      
      const updatedUser = { ...users[userIndex], ...updates } as any;
      users[userIndex] = updatedUser;
      saveUsers();

      if (user?.id === userId) {
        setUser(updatedUser);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      }
      toast.success('Profile updated');
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    isAuthenticated: !!user,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};