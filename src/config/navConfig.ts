import type { NavItem, UserRole } from '@/types';
import {
  LayoutDashboard,
  FileText,
  Megaphone,
  BookOpen,
  Users,
  Briefcase,
  Settings,
  ShieldCheck,
  GraduationCap,
  ScrollText,
  Library,
  Newspaper,
  Presentation
} from 'lucide-react';

const allRoles: UserRole[] = ['Administrador', 'Instructor', 'Personal'];

export const navConfig: NavItem[] = [
  // Administrador
  {
    title: 'Panel de Administrador',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    roles: ['Administrador'],
  },
  {
    title: 'Gestión de Contenido',
    href: '#', // Parent item
    icon: FileText,
    roles: ['Administrador'],
    children: [
      { title: 'Páginas Informativas', href: '/admin/gestion-contenido/paginas', icon: Newspaper, roles: ['Administrador'] },
      { title: 'Políticas y Documentos', href: '/admin/gestion-contenido/documentos', icon: ScrollText, roles: ['Administrador'] },
      { title: 'Anuncios', href: '/admin/gestion-contenido/anuncios', icon: Megaphone, roles: ['Administrador'] },
    ],
  },
  {
    title: 'Gestión de Capacitaciones',
    href: '#', // Parent item
    icon: GraduationCap,
    roles: ['Administrador'],
    children: [
      { title: 'Dashboard LMS', href: '/admin/capacitaciones/dashboard', icon: LayoutDashboard, roles: ['Administrador'] },
      { title: 'Cursos', href: '/admin/capacitaciones/cursos', icon: Library, roles: ['Administrador'] },
      { title: 'Instructores', href: '/admin/capacitaciones/instructores', icon: Briefcase, roles: ['Administrador'] },
      { title: 'Reportes', href: '/admin/capacitaciones/reportes', icon: Presentation, roles: ['Administrador'] },
    ],
  },
  {
    title: 'Gestión de Usuarios',
    href: '/admin/usuarios',
    icon: Users,
    roles: ['Administrador'],
  },
  {
    title: 'Configuración Plataforma',
    href: '/admin/configuracion',
    icon: Settings,
    roles: ['Administrador'],
  },

  // Instructor
  {
    title: 'Panel de Instructor',
    href: '/instructor/dashboard',
    icon: LayoutDashboard,
    roles: ['Instructor'],
  },
  {
    title: 'Mis Cursos',
    href: '/instructor/cursos',
    icon: Library,
    roles: ['Instructor'],
    children: [
       { title: 'Crear Curso', href: '/instructor/cursos/crear', icon: GraduationCap, roles: ['Instructor'] },
       { title: 'Gestionar Cursos', href: '/instructor/cursos/gestionar', icon: Settings, roles: ['Instructor'] },
    ]
  },
  {
    title: 'Progreso de Estudiantes',
    href: '/instructor/progreso',
    icon: Presentation,
    roles: ['Instructor'],
  },

  // Personal
  {
    title: 'Inicio Personal',
    href: '/personal/dashboard',
    icon: LayoutDashboard,
    roles: ['Personal'],
  },
  {
    title: 'Divulgación General',
    href: '#',
    icon: Newspaper,
    roles: ['Personal'],
    children: [
      { title: 'Páginas Informativas', href: '/personal/divulgacion/paginas', icon: FileText, roles: ['Personal'] },
      { title: 'Políticas y Documentos', href: '/personal/divulgacion/documentos', icon: ScrollText, roles: ['Personal'] },
      { title: 'Anuncios Recientes', href: '/personal/divulgacion/anuncios', icon: Megaphone, roles: ['Personal'] },
    ],
  },
  {
    title: 'Capacitaciones',
    href: '/personal/capacitacion/cursos',
    icon: GraduationCap,
    roles: ['Personal'],
    children: [
        { title: 'Mis Cursos Asignados', href: '/personal/capacitacion/mis-cursos', icon: Library, roles: ['Personal'] },
        { title: 'Catálogo de Cursos', href: '/personal/capacitacion/catalogo', icon: BookOpen, roles: ['Personal'] },
    ]
  },
  {
    title: 'Mi Perfil',
    href: '/personal/perfil',
    icon: Users,
    roles: allRoles,
  },
];
