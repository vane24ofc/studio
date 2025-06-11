"use client";

import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogOut } from 'lucide-react';

export function RoleSwitcher() {
  const { role, login, logout } = useAuth();

  const handleRoleChange = (newRole: string) => {
    login(newRole as UserRole);
  };

  if (!role) return null;

  return (
    <div className="flex items-center gap-2 p-2 bg-card rounded-md shadow">
      <span className="text-sm font-medium text-foreground">Rol Actual:</span>
      <Select value={role || ''} onValueChange={handleRoleChange}>
        <SelectTrigger className="w-[180px] bg-background text-foreground border-border focus:ring-accent">
          <SelectValue placeholder="Seleccionar Rol" />
        </SelectTrigger>
        <SelectContent className="bg-popover text-popover-foreground border-border">
          <SelectItem value="Administrador" className="focus:bg-accent focus:text-accent-foreground">Administrador</SelectItem>
          <SelectItem value="Instructor" className="focus:bg-accent focus:text-accent-foreground">Instructor</SelectItem>
          <SelectItem value="Personal" className="focus:bg-accent focus:text-accent-foreground">Personal</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-accent">
        <LogOut className="h-5 w-5" />
        <span className="sr-only">Cerrar Sesión</span>
      </Button>
    </div>
  );
}
