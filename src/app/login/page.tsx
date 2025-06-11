"use client";

import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Briefcase, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { login, role, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && role) {
      // If already logged in, redirect away from login
      const path = role === 'Administrador' ? '/admin/dashboard' : role === 'Instructor' ? '/instructor/dashboard' : '/personal/dashboard';
      router.replace(path);
    }
  }, [role, isLoading, router]);

  if (isLoading || role) {
     return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-foreground">Cargando...</p>
      </div>
    );
  }

  const handleLogin = (selectedRole: UserRole) => {
    login(selectedRole);
  };

  const roles: { name: UserRole; label: string; icon: React.ElementType }[] = [
    { name: 'Administrador', label: 'Administrador', icon: Shield },
    { name: 'Instructor', label: 'Instructor', icon: Briefcase },
    { name: 'Personal', label: 'Personal', icon: Users },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-headline font-bold text-primary">NexusAlpri</h1>
        <p className="text-xl text-muted-foreground mt-2 font-body">El Lienzo Negro</p>
      </header>
      <Card className="w-full max-w-md bg-card shadow-2xl shadow-accent/10">
        <CardHeader>
          <CardTitle className="text-3xl text-center text-foreground font-headline">Seleccionar Rol</CardTitle>
          <CardDescription className="text-center text-muted-foreground font-body">
            Elige tu rol para acceder a la plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {roles.map(({ name, label, icon: Icon }) => (
            <Button
              key={name}
              onClick={() => handleLogin(name)}
              className="w-full h-14 text-lg bg-secondary hover:bg-accent hover:text-accent-foreground text-secondary-foreground"
              variant="outline"
            >
              <Icon className="mr-3 h-6 w-6 text-accent group-hover:text-accent-foreground" />
              {label}
            </Button>
          ))}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground text-center w-full">
            Las funcionalidades variarán según el rol seleccionado.
          </p>
        </CardFooter>
      </Card>
      <footer className="mt-12 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} NexusAlpri. Todos los derechos reservados.</p>
        <p>Diseñado para la eficiencia y la colaboración.</p>
      </footer>
    </div>
  );
}
