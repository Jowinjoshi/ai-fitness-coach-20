"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastLoginDate?: string;
  isGuest: boolean;
  stats?: {
    totalAchievements: number;
    totalQuizzes: number;
    totalLoginDays: number;
  };
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string, fullName?: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('fitness-user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      refreshUser(parsedUser.id);
    }
    setIsLoading(false);
  }, []);

  const refreshUser = async (userId?: number) => {
    const id = userId || user?.id;
    if (!id) return;

    try {
      const response = await fetch(`/api/user/profile?id=${id}`);
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('fitness-user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const login = async (email: string, password: string) => {
    // Simplified auth - in production, use proper authentication
    // For demo, we'll find user by email
    try {
      const response = await fetch(`/api/user/profile?email=${email}`);
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('fitness-user', JSON.stringify(userData));
        
        // Record daily login
        await fetch('/api/user/daily-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userData.id })
        });
        
        await refreshUser(userData.id);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      throw new Error('Login failed');
    }
  };

  const signup = async (username: string, email: string, password: string, fullName?: string) => {
    // Simplified signup - in production, use proper authentication
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, fullName })
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('fitness-user', JSON.stringify(userData));
      } else {
        throw new Error('Signup failed');
      }
    } catch (error) {
      throw new Error('Signup failed');
    }
  };

  const loginAsGuest = async () => {
    const guestUsername = `guest_${Date.now()}`;
    const guestEmail = `${guestUsername}@guest.local`;
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: guestUsername, 
          email: guestEmail, 
          isGuest: true,
          fullName: 'Guest User'
        })
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('fitness-user', JSON.stringify(userData));
      }
    } catch (error) {
      throw new Error('Guest login failed');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fitness-user');
  };

  return (
    <UserContext.Provider value={{ user, setUser, login, signup, loginAsGuest, logout, refreshUser, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
