"use client";

import type { UserRole, User } from '@/types';
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  login: (role: UserRole) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Simulate checking auth status (e.g., from localStorage or a cookie)
    const storedRole = localStorage.getItem('userRole') as UserRole;
    if (storedRole) {
      setRole(storedRole);
      setUser({ id: '1', name: `Usuario ${storedRole}`, role: storedRole });
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading && !role && pathname !== '/login') {
      router.push('/login');
    } else if (!isLoading && role && pathname === '/login') {
      // Redirect to role-specific dashboard if logged in and on login page
      redirectToDashboard(role);
    }
  }, [role, isLoading, pathname, router]);


  const login = (selectedRole: UserRole) => {
    if (selectedRole) {
      setRole(selectedRole);
      setUser({ id: '1', name: `Usuario ${selectedRole}`, role: selectedRole });
      localStorage.setItem('userRole', selectedRole);
      redirectToDashboard(selectedRole);
    }
  };

  const logout = () => {
    setRole(null);
    setUser(null);
    localStorage.removeItem('userRole');
    router.push('/login');
  };

  const redirectToDashboard = (currentRole: UserRole) => {
    switch (currentRole) {
      case 'Administrador':
        router.push('/admin/dashboard');
        break;
      case 'Instructor':
        router.push('/instructor/dashboard');
        break;
      case 'Personal':
        router.push('/personal/dashboard');
        break;
      default:
        router.push('/login');
    }
  };
  

  return (
    <AuthContext.Provider value={{ user, role, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
