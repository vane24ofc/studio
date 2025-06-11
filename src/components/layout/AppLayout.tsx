"use client";

import React, { useState, createContext, useContext } from 'react';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export interface SidebarContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useAppSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useAppSidebar must be used within a AppLayout");
  }
  return context;
};


export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default to closed on mobile
  const { isLoading, role } = useAuth();
  const router = useRouter();

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };
  
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="space-y-4 w-full max-w-sm p-8">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (!role) {
    // This should ideally be handled by AuthContext redirect, but as a safeguard:
    if (typeof window !== 'undefined') router.push('/login');
    return null; // or a loading/redirecting state
  }
  

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar }}>
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <div className="flex flex-1 overflow-hidden">
          {/* Desktop Sidebar */}
          <div className="hidden md:block md:w-64 lg:w-72 fixed top-16 left-0 h-[calc(100vh-4rem)] z-30">
             <AppSidebar />
          </div>

          {/* Mobile Sidebar (Drawer) */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 z-30 bg-black/50 md:hidden" 
              onClick={toggleSidebar} 
              aria-hidden="true"
            />
          )}
          <div 
            className={cn(
              "fixed top-16 left-0 h-[calc(100vh-4rem)] w-64 lg:w-72 bg-sidebar z-40 transform transition-transform duration-300 ease-in-out md:hidden",
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}
          >
            <AppSidebar />
          </div>
          
          <main className="flex-1 overflow-y-auto md:ml-64 lg:ml-72 p-4 sm:p-6 lg:p-8">
            <div className="container mx-auto max-w-full">
               {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
