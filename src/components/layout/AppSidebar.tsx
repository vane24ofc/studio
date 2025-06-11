"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { navConfig } from '@/config/navConfig';
import type { NavItem } from '@/types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ChevronsUpDown, LogOut } from 'lucide-react';

interface AppSidebarProps {
  className?: string;
}

export function AppSidebar({ className }: AppSidebarProps) {
  const pathname = usePathname();
  const { role, user, logout } = useAuth();

  const filteredNavConfig = navConfig.filter(item => item.roles.includes(role));

  const renderNavItem = (item: NavItem, isSubItem = false) => {
    const isActive = item.href === '#' ? false : pathname.startsWith(item.href);
    const Icon = item.icon;

    if (item.children && item.children.length > 0) {
      // Determine if any child is active to keep accordion open
      const isChildActive = item.children.some(child => pathname.startsWith(child.href));
      const defaultOpenValue = isChildActive ? item.title : undefined;

      return (
        <Accordion type="single" collapsible defaultValue={defaultOpenValue} className="w-full">
          <AccordionItem value={item.title} className="border-b-0">
            <AccordionTrigger 
              className={cn(
                "flex items-center justify-between w-full py-2 px-3 rounded-md text-sm font-medium transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isChildActive ? "text-sidebar-primary" : "text-sidebar-foreground",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              )}
            >
              <div className="flex items-center">
                {Icon && <Icon className={cn("mr-3 h-5 w-5", isChildActive ? "text-sidebar-primary" : "text-sidebar-foreground/80")} />}
                {item.title}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pl-4 pt-1 pb-0">
              <ul className="space-y-1">
                {item.children.filter(child => child.roles.includes(role)).map(child => (
                  <li key={child.href}>{renderNavItem(child, true)}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    }

    return (
      <Link href={item.href} passHref legacyBehavior>
        <a
          className={cn(
            "flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors",
            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            isActive ? "bg-sidebar-accent text-sidebar-primary font-semibold" : "text-sidebar-foreground",
            isSubItem ? "pl-8" : "",
            item.disabled && "opacity-50 cursor-not-allowed"
          )}
          aria-disabled={item.disabled}
          onClick={(e) => item.disabled && e.preventDefault()}
        >
          {Icon && <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-sidebar-primary" : "text-sidebar-foreground/80")} />}
          {item.title}
          {item.label && (
            <span className="ml-auto text-xs bg-sidebar-primary text-sidebar-primary-foreground px-1.5 py-0.5 rounded-full">
              {item.label}
            </span>
          )}
        </a>
      </Link>
    );
  };

  return (
    <aside className={cn("h-full flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground", className)}>
      <div className="p-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2">
           {/* Minimalist Logo/Icon if available */}
          <ChevronsUpDown className="h-8 w-8 text-primary" /> 
          <h2 className="text-2xl font-headline font-bold text-primary">NexusAlpri</h2>
        </Link>
      </div>

      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-1">
          {filteredNavConfig.map(item => (
            <div key={item.title}>{renderNavItem(item)}</div>
          ))}
        </nav>
      </ScrollArea>

      {user && (
        <div className="p-3 border-t border-sidebar-border mt-auto">
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={logout}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Cerrar Sesión
          </Button>
        </div>
      )}
    </aside>
  );
}
