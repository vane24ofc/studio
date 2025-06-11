export type UserRole = 'Administrador' | 'Instructor' | 'Personal' | null;

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  roles: UserRole[];
  children?: NavItem[];
  label?: string; // For badges or additional info
  disabled?: boolean;
}
