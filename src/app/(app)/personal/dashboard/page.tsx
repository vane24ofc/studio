import { PageTitle } from '@/components/shared/PageTitle';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Megaphone, ScrollText, GraduationCap, ArrowRight } from 'lucide-react';

export default function PersonalDashboardPage() {
  const announcements = [
    { id: 1, title: "Mantenimiento Programado", urgency: "Urgente", date: "2024-07-28", brief: "El sistema estará en mantenimiento este domingo...", fixed: true },
    { id: 2, title: "Nueva Política de Vacaciones", urgency: "Normal", date: "2024-07-25", brief: "Se ha actualizado la política de vacaciones...", fixed: false },
  ];

  const recentDocuments = [
    { id: 1, title: "Guía de Bienvenida v3.0", category: "General", date: "2024-07-26" },
    { id: 2, title: "Protocolo de Seguridad", category: "Políticas", date: "2024-07-24" },
  ];
  
  const assignedCourses = [
    { id: 1, title: "Seguridad Informática Básica", progress: 75 },
    { id: 2, title: "Comunicación Efectiva", progress: 20 },
  ];

  const getUrgencyClass = (urgency: string) => {
    switch (urgency) {
      case 'Urgente': return 'border-red-500 text-red-400';
      case 'Crítico': return 'border-red-700 text-red-500 animate-pulse';
      default: return 'border-accent text-accent';
    }
  };


  return (
    <div>
      <PageTitle title="Bienvenido a NexusAlpri" description="Tu portal de información y desarrollo profesional." />

      {/* Anuncios Destacados */}
      <section className="mb-8">
        <h2 className="text-2xl font-headline font-semibold text-foreground mb-4">Anuncios Destacados</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {announcements.filter(a => a.fixed).map(ann => (
            <Card key={ann.id} className={`bg-card shadow-md border-l-4 ${getUrgencyClass(ann.urgency)}`}>
              <CardHeader>
                <CardTitle className="text-lg text-foreground">{ann.title} <span className={`text-xs px-2 py-0.5 rounded-full border ${getUrgencyClass(ann.urgency)} bg-transparent`}>{ann.urgency}</span></CardTitle>
                <p className="text-xs text-muted-foreground">{ann.date}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{ann.brief}</p>
                <Button variant="link" asChild className="p-0 h-auto text-accent hover:text-primary">
                  <Link href={`/personal/divulgacion/anuncios/${ann.id}`}>Leer más <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        {announcements.filter(a => a.fixed).length === 0 && <p className="text-muted-foreground">No hay anuncios destacados por el momento.</p>}
      </section>

      {/* Acceso Rápido y Capacitaciones */}
      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-2xl font-headline font-semibold text-foreground mb-4">Acceso Rápido</h2>
          <Card className="bg-card shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Políticas y Documentos Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {recentDocuments.map(doc => (
                  <li key={doc.id} className="flex items-center justify-between p-3 bg-background/50 rounded-md hover:bg-accent/10 transition-colors">
                    <div >
                      <Link href={`/personal/divulgacion/documentos/${doc.id}`} className="text-sm font-medium text-foreground hover:text-primary">{doc.title}</Link>
                      <p className="text-xs text-muted-foreground">{doc.category} - {doc.date}</p>
                    </div>
                    <ScrollText className="h-5 w-5 text-accent" />
                  </li>
                ))}
              </ul>
              <Button variant="outline" asChild className="mt-4 w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                <Link href="/personal/divulgacion/documentos">Ver todos los documentos</Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-headline font-semibold text-foreground mb-4">Mis Capacitaciones</h2>
          <Card className="bg-card shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Cursos Asignados/Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              {assignedCourses.length > 0 ? (
                <ul className="space-y-3">
                  {assignedCourses.map(course => (
                    <li key={course.id} className="p-3 bg-background/50 rounded-md hover:bg-accent/10 transition-colors">
                      <Link href={`/personal/capacitacion/cursos/${course.id}`} className="block">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground hover:text-primary">{course.title}</span>
                          <GraduationCap className="h-5 w-5 text-accent" />
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-accent" style={{width: `${course.progress}%`}}></div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 text-right">{course.progress}% completado</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No tienes cursos asignados actualmente.</p>
              )}
              <Button variant="outline" asChild className="mt-4 w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground">
                <Link href="/personal/capacitacion/catalogo">Explorar Catálogo de Cursos</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
