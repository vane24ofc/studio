import React from 'react';
import { cn } from '@/lib/utils';

interface PageTitleProps {
  title: string;
  description?: string;
  className?: string;
  actions?: React.ReactNode;
}

export function PageTitle({ title, description, className, actions }: PageTitleProps) {
  return (
    <div className={cn("mb-6 md:mb-8", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-headline font-bold text-foreground">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-base text-muted-foreground font-body">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
      <hr className="mt-4 border-border/50" />
    </div>
  );
}
