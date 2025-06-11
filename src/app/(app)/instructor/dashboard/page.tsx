import { PageTitle } from '@/components/shared/PageTitle';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Library, Users, MessageSquare } from 'lucide-react';

export default function InstructorDashboardPage() {
  const stats = [
    { title: "Mis Cursos Activos", value: "3", icon: Library, color: "text-accent" },
    { title: "Estudiantes Inscritos (Total)", value: "45", icon: Users, color: "text-primary" },
    { title: "Nuevos Comentarios/Preguntas", value: "2", icon: MessageSquare, color: "text-orange-400" },
  ];

  return (
    <div>
      <PageTitle title="Panel de Control del Instructor" description="Resumen de tus cursos y actividad de estudiantes." />
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
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

      <div className="grid gap-6">
        <Card className="bg-card shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Resumen de Cursos</CardTitle>
            <CardDescription>Estado y progreso de los cursos que gestionas.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Placeholder for course list or summary */}
            <p className="text-muted-foreground italic">Listado de mis cursos con estado (publicado, borrador) y estadísticas básicas aquí.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
