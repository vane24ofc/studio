import { PageTitle } from '@/components/shared/PageTitle';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, FileText, Megaphone, Users } from 'lucide-react';

export default function AdminDashboardPage() {
  const stats = [
    { title: "Documentos Nuevos (Mes)", value: "12", icon: FileText, color: "text-accent" },
    { title: "Anuncios Activos", value: "5", icon: Megaphone, color: "text-primary" },
    { title: "Usuarios Registrados", value: "150", icon: Users, color: "text-purple-400" },
    { title: "Visitas Clave (Semana)", value: "87%", icon: BarChart, color: "text-orange-400" },
  ];

  return (
    <div>
      <PageTitle title="Panel de Control del Administrador" description="Resumen de la actividad reciente y estadísticas clave de la plataforma." />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-card shadow-lg hover:shadow-accent/20 transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones en la plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><span className="font-semibold text-foreground">Nuevo Documento:</span> "Política de Teletrabajo v2" subido.</li>
              <li><span className="font-semibold text-foreground">Anuncio Publicado:</span> "Mantenimiento Programado del Sistema".</li>
              <li><span className="font-semibold text-foreground">Página Actualizada:</span> "Nuestra Misión y Visión".</li>
              <li><span className="font-semibold text-foreground">Nuevo Curso Creado:</span> "Introducción a NexusAlpri".</li>
            </ul>
            {/* Placeholder for actual activity feed */}
          </CardContent>
        </Card>
        <Card className="bg-card shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Estadísticas de Uso (Gráfico)</CardTitle>
            <CardDescription>Visualización del uso de la plataforma.</CardDescription>
          </CardHeader>
          <CardContent className="h-[200px] flex items-center justify-center">
            <p className="text-muted-foreground italic">Gráfico minimalista sobre fondo negro aquí (usando barras o líneas con colores neón)</p>
            {/* Placeholder for chart component. Example: <BarChart data={...} /> */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
