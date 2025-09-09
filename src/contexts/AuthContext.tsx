"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface User {
  walletAddress: string;
  username?: string;
  profilePictureUrl?: string;
  permissions?: {
    notifications: boolean;
    contacts: boolean;
  };
  optedIntoOptionalAnalytics?: boolean;
  worldAppVersion?: number;
  deviceOS?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if user is already authenticated in localStorage
        const storedUser = localStorage.getItem('pool_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          
          // Verify user is still connected in MiniKit
          if (typeof window !== 'undefined' && window.MiniKit) {
            try {
              const minikitUser = await window.MiniKit.getUserByAddress(userData.walletAddress);
              if (minikitUser) {
                // Update user data with latest from MiniKit
                const updatedUser = {
                  ...userData,
                  username: minikitUser.username || userData.username,
                  profilePictureUrl: minikitUser.profilePictureUrl || userData.profilePictureUrl,
                  permissions: userData.permissions, // Keep existing permissions as MiniKit doesn't provide them
                };
                setUser(updatedUser);
                localStorage.setItem('pool_user', JSON.stringify(updatedUser));
              }
            } catch (error) {
              console.warn('Could not verify user with MiniKit:', error);
              // Keep user logged in even if MiniKit verification fails
            }
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid stored data
        localStorage.removeItem('pool_user');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('pool_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('pool_user');
  };

  const refreshUser = async () => {
    if (!user || typeof window === 'undefined' || !window.MiniKit) {
      return;
    }

    try {
      const minikitUser = await window.MiniKit.getUserByAddress(user.walletAddress);
      if (minikitUser) {
        const updatedUser = {
          ...user,
          username: minikitUser.username || user.username,
          profilePictureUrl: minikitUser.profilePictureUrl || user.profilePictureUrl,
          permissions: user.permissions, // Keep existing permissions as MiniKit doesn't provide them
        };
        setUser(updatedUser);
        localStorage.setItem('pool_user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.warn('Could not refresh user data:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
