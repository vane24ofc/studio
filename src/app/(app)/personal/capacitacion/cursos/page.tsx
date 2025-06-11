"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PersonalCoursesBasePage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/personal/capacitacion/catalogo');
  }, [router]);
  return null;
}
