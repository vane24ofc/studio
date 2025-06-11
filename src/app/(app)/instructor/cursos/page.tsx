"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InstructorCoursesBasePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/instructor/cursos/gestionar');
  }, [router]);
  return null; 
}
