import { PageTitle } from './PageTitle';
import { Construction } from 'lucide-react';

interface ComingSoonProps {
  pageTitle: string;
  description?: string;
}

export function ComingSoon({ pageTitle, description = "Esta sección está actualmente en desarrollo. ¡Vuelve pronto!" }: ComingSoonProps) {
  return (
    <div>
      <PageTitle title={pageTitle} />
      <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-lg bg-card min-h-[300px]">
        <Construction className="w-16 h-16 text-accent mb-6" />
        <h2 className="text-2xl font-headline font-semibold text-foreground mb-2">Próximamente</h2>
        <p className="text-muted-foreground max-w-md">{description}</p>
      </div>
    </div>
  );
}
