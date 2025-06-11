"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth'; // Ensure this path is correct

export default function HomePage() {
  const router = useRouter();
  const { isLoading, role } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (role) {
        // If already logged in, redirect to respective dashboard
        switch (role) {
          case 'Administrador':
            router.replace('/admin/dashboard');
            break;
          case 'Instructor':
            router.replace('/instructor/dashboard');
            break;
          case 'Personal':
            router.replace('/personal/dashboard');
            break;
          default:
            router.replace('/login');
        }
      } else {
        // If not logged in, redirect to login page
        router.replace('/login');
      }
    }
  }, [isLoading, role, router]);

  // Optional: Show a loading state or a blank page while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <p className="text-foreground">Cargando...</p>
    </div>
  );
}
