"use client";

import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, UserCircle, Moon, Sun, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { RoleSwitcher } from '@/components/auth/RoleSwitcher'; // For dev
import { cn } from '@/lib/utils';
import type { SidebarContextType } from './AppLayout'; // Assuming type is exported from AppLayout

interface AppHeaderProps {
  toggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  sidebarContext?: SidebarContextType; // Make this optional or handle its absence
}


export function AppHeader({ toggleSidebar, isSidebarOpen, sidebarContext }: AppHeaderProps) {
  const { user, logout } = useAuth();
  // const { toggleSidebar, isSidebarOpen } = sidebarContext || { toggleSidebar: () => {}, isSidebarOpen: false };


  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          {toggleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="mr-2 md:hidden text-foreground hover:bg-accent/20 hover:text-accent"
              aria-label={isSidebarOpen ? "Cerrar menú lateral" : "Abrir menú lateral"}
            >
              {isSidebarOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
            </Button>
          )}
          <h1 className="text-xl font-headline font-semibold text-primary hidden sm:block">NexusAlpri</h1>
        </div>

        <div className="flex items-center gap-4">
          {process.env.NODE_ENV === 'development' && <RoleSwitcher />}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-accent/20">
                  <Avatar className="h-9 w-9 border-2 border-accent">
                    <AvatarImage src={user.avatar || `https://placehold.co/100x100.png?text=${user.name?.[0] || 'U'}`} alt={user.name || 'Usuario'} data-ai-hint="user avatar" />
                    <AvatarFallback className="bg-muted text-muted-foreground">{user.name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-foreground">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer group">
                  <LogOut className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-accent" />
                  <span className="group-hover:text-accent">Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
