
"use client";

import React, { useState, useEffect } from 'react';
import { PageTitle } from '@/components/shared/PageTitle';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, Edit, Trash2, Calendar as CalendarIcon, GripVertical } from 'lucide-react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { UserRole as AppUserRole } from '@/types';

type UrgencyLevel = 'Normal' | 'Importante' | 'Urgente' | 'Crítico';
const urgencyLevels: UrgencyLevel[] = ['Normal', 'Importante', 'Urgente', 'Crítico'];

// Extended UserRole for 'Todos' in target audience
type TargetAudienceRole = Exclude<AppUserRole, null> | 'Todos';
const targetAudienceOptions: { id: TargetAudienceRole, label: string }[] = [
  { id: 'Administrador', label: 'Administradores' },
  { id: 'Instructor', label: 'Instructores' },
  { id: 'Personal', label: 'Personal' },
  { id: 'Todos', label: 'Todos (General)' },
];


interface Announcement {
  id: string;
  title: string;
  content: string;
  urgency: UrgencyLevel;
  publicationDate: Date;
  expirationDate?: Date | null;
  author: string;
  targetAudience: TargetAudienceRole[];
  isPublished: boolean;
  isSticky: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const initialAnnouncementsData: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt' | 'author'>[] = [
  {
    title: 'Mantenimiento Programado del Sistema',
    content: 'El sistema estará en mantenimiento este domingo de 02:00 a 04:00 AM.',
    urgency: 'Urgente',
    publicationDate: new Date('2024-07-28T10:00:00Z'),
    expirationDate: new Date('2024-07-29T10:00:00Z'),
    targetAudience: ['Todos'],
    isPublished: true,
    isSticky: true,
  },
  {
    title: 'Nueva Política de Vacaciones 2024',
    content: 'Se ha actualizado la política de vacaciones. Por favor, revísenla en la sección de documentos.',
    urgency: 'Importante',
    publicationDate: new Date('2024-07-25T00:00:00Z'),
    targetAudience: ['Personal', 'Instructor'],
    isPublished: true,
    isSticky: false,
  },
  {
    title: 'Convocatoria Curso de Liderazgo',
    content: 'Abiertas las inscripciones para el nuevo curso de liderazgo. ¡Cupos limitados!',
    urgency: 'Normal',
    publicationDate: new Date('2024-08-01T00:00:00Z'),
    expirationDate: null,
    targetAudience: ['Instructor', 'Personal'],
    isPublished: false,
    isSticky: false,
  },
];

const announcementSchema = z.object({
  title: z.string().min(5, { message: 'El título debe tener al menos 5 caracteres.' }).max(100, { message: 'El título no puede exceder los 100 caracteres.' }),
  content: z.string().min(10, { message: 'El contenido debe tener al menos 10 caracteres.' }),
  urgency: z.enum(urgencyLevels as [UrgencyLevel, ...UrgencyLevel[]], { required_error: 'Debe seleccionar un nivel de urgencia.' }),
  publicationDate: z.date({ required_error: 'La fecha de publicación es obligatoria.' }),
  expirationDate: z.date().nullable().optional(),
  targetAudience: z.array(z.enum(targetAudienceOptions.map(o => o.id) as [TargetAudienceRole, ...TargetAudienceRole[]]))
                  .min(1, { message: 'Debe seleccionar al menos una audiencia.' }),
  isPublished: z.boolean().default(false),
  isSticky: z.boolean().default(false),
}).superRefine((data, ctx) => {
  if (data.expirationDate && data.publicationDate && data.publicationDate >= data.expirationDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La fecha de expiración debe ser posterior a la fecha de publicación.",
      path: ["expirationDate"],
    });
  }
});

type AnnouncementFormData = z.infer<typeof announcementSchema>;

export default function AdminGestionAnunciosPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    // Simulate fetching data or initializing with mock data
    setAnnouncements(
      initialAnnouncementsData.map((ann, index) => ({
        ...ann,
        id: `ann-${index + 1}-${Date.now()}`,
        author: 'Admin Sistema',
        createdAt: new Date(Date.now() - (initialAnnouncementsData.length - index) * 24 * 60 * 60 * 1000), // Stagger creation dates
        updatedAt: new Date(Date.now() - (initialAnnouncementsData.length - index) * 24 * 60 * 60 * 1000),
      }))
    );
  }, []);


  const form = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: '',
      content: '',
      urgency: 'Normal',
      publicationDate: new Date(),
      expirationDate: null,
      targetAudience: [],
      isPublished: false,
      isSticky: false,
    },
  });

  const { reset, control, handleSubmit, setValue, watch, formState: { errors } } = form;
  const watchedTargetAudience = watch("targetAudience");

  useEffect(() => {
    // Handle "Todos" selection logic for targetAudience
    const currentAudience = watchedTargetAudience || [];
    if (currentAudience.includes('Todos') && currentAudience.length > 1) {
      // If 'Todos' is selected along with others, keep only 'Todos'
      setValue('targetAudience', ['Todos']);
    }
  }, [watchedTargetAudience, setValue]);


  const handleOpenCreateDialog = () => {
    reset({
      title: '',
      content: '',
      urgency: 'Normal',
      publicationDate: new Date(),
      expirationDate: null,
      targetAudience: [],
      isPublished: true, // Default to published for new announcements
      isSticky: false,
    });
    setIsCreateDialogOpen(true);
  };

  const handleOpenEditDialog = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    reset({
      title: announcement.title,
      content: announcement.content,
      urgency: announcement.urgency,
      publicationDate: announcement.publicationDate,
      expirationDate: announcement.expirationDate,
      targetAudience: announcement.targetAudience,
      isPublished: announcement.isPublished,
      isSticky: announcement.isSticky,
    });
    setIsEditDialogOpen(true);
  };
  
  const handleOpenDeleteDialog = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDialogs = () => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setSelectedAnnouncement(null);
    reset(); 
  };

  const onSubmitOps: SubmitHandler<AnnouncementFormData> = (data) => {
    const finalAudience = data.targetAudience.includes('Todos') ? ['Todos'] : data.targetAudience;
    if (selectedAnnouncement && isEditDialogOpen) { // Editing
      const updatedAnnouncement: Announcement = {
        ...selectedAnnouncement,
        ...data,
        targetAudience: finalAudience,
        updatedAt: new Date(),
      };
      setAnnouncements(prev => prev.map(ann => ann.id === selectedAnnouncement.id ? updatedAnnouncement : ann));
    } else { // Creating
      const newAnnouncement: Announcement = {
        ...data,
        id: `ann-${Date.now()}`, 
        author: 'Admin Actual', 
        targetAudience: finalAudience,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setAnnouncements(prev => [newAnnouncement, ...prev]);
    }
    handleCloseDialogs();
  };

  const handleDeleteConfirm = () => {
    if (!selectedAnnouncement) return;
    setAnnouncements(prev => prev.filter(ann => ann.id !== selectedAnnouncement.id));
    handleCloseDialogs();
  };

  const getUrgencyBadgeVariant = (urgency: UrgencyLevel): "default" | "secondary" | "destructive" | "outline" => {
    switch (urgency) {
      case 'Crítico': return 'destructive';
      case 'Urgente': return 'destructive';
      case 'Importante': return 'secondary';
      default: return 'outline';
    }
  };

  const renderFormFields = () => (
    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="title" className="text-right">Título</Label>
        <Input id="title" {...form.register("title")} className="col-span-3" />
      </div>
      {errors.title && <p className="col-start-2 col-span-3 text-sm text-destructive">{errors.title.message}</p>}

      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="content" className="text-right pt-2">Contenido</Label>
        <Textarea id="content" {...form.register("content")} className="col-span-3 min-h-[100px]" />
      </div>
       {errors.content && <p className="col-start-2 col-span-3 text-sm text-destructive">{errors.content.message}</p>}

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="urgency" className="text-right">Urgencia</Label>
        <Controller
          name="urgency"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Seleccionar urgencia" />
              </SelectTrigger>
              <SelectContent>
                {urgencyLevels.map(level => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>
      {errors.urgency && <p className="col-start-2 col-span-3 text-sm text-destructive">{errors.urgency.message}</p>}

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="publicationDate" className="text-right">F. Publicación</Label>
        <Controller
          name="publicationDate"
          control={control}
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("col-span-3 justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
              </PopoverContent>
            </Popover>
          )}
        />
      </div>
       {errors.publicationDate && <p className="col-start-2 col-span-3 text-sm text-destructive">{errors.publicationDate.message}</p>}

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="expirationDate" className="text-right">F. Expiración</Label>
        <Controller
          name="expirationDate"
          control={control}
          render={({ field }) => (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("col-span-3 justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccionar fecha (opcional)</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={field.value || undefined} onSelect={field.onChange} initialFocus />
              </PopoverContent>
            </Popover>
          )}
        />
      </div>
      {errors.expirationDate && <p className="col-start-2 col-span-3 text-sm text-destructive">{errors.expirationDate.message}</p>}

      <div className="grid grid-cols-4 items-start gap-4">
        <Label className="text-right pt-2">Audiencia</Label>
        <div className="col-span-3 space-y-2">
          {targetAudienceOptions.map((option) => (
            <Controller
              key={option.id}
              name="targetAudience"
              control={control}
              render={({ field }) => {
                const isChecked = field.value?.includes(option.id);
                const isDisabled = field.value?.includes('Todos') && option.id !== 'Todos';
                return (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`audience-${option.id}`}
                      checked={isChecked}
                      disabled={isDisabled}
                      onCheckedChange={(checked) => {
                        let newValue = [...(field.value || [])];
                        if (option.id === 'Todos') {
                          newValue = checked ? ['Todos'] : [];
                        } else {
                          if (checked) {
                            if (!newValue.includes(option.id)) newValue.push(option.id);
                             // If a specific role is checked, 'Todos' should be unselected
                            newValue = newValue.filter(id => id !== 'Todos');
                          } else {
                            newValue = newValue.filter(id => id !== option.id);
                          }
                        }
                        field.onChange(newValue);
                      }}
                    />
                    <label
                      htmlFor={`audience-${option.id}`}
                      className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed", isDisabled ? "text-muted-foreground opacity-70" : "peer-disabled:opacity-70")}
                    >
                      {option.label}
                    </label>
                  </div>
                );
              }}
            />
          ))}
        </div>
      </div>
       {errors.targetAudience && <p className="col-start-2 col-span-3 text-sm text-destructive">{errors.targetAudience.message}</p>}

      <div className="grid grid-cols-4 items-center gap-4">
        <div /> 
        <div className="col-span-3 flex items-center space-x-6 pt-2">
            <Controller
                name="isPublished"
                control={control}
                render={({ field }) => (
                    <div className="flex items-center space-x-2">
                        <Checkbox id="isPublished" checked={field.value} onCheckedChange={field.onChange} />
                        <Label htmlFor="isPublished">Publicar Anuncio</Label>
                    </div>
                )}
            />
            <Controller
                name="isSticky"
                control={control}
                render={({ field }) => (
                    <div className="flex items-center space-x-2">
                        <Checkbox id="isSticky" checked={field.value} onCheckedChange={field.onChange} />
                        <Label htmlFor="isSticky">Destacar (Fijar)</Label>
                    </div>
                )}
            />
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <PageTitle
        title="Gestión de Anuncios"
        description="Crea, edita y gestiona los anuncios para toda la organización."
        actions={
          <Button onClick={handleOpenCreateDialog}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Crear Anuncio
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableCaption>
              {announcements.length === 0 ? "No hay anuncios para mostrar." : `Total de anuncios: ${announcements.length}.`}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px] hidden md:table-cell px-2"></TableHead>
                <TableHead>Título</TableHead>
                <TableHead className="hidden sm:table-cell">Urgencia</TableHead>
                <TableHead className="hidden lg:table-cell">Publicación</TableHead>
                <TableHead className="hidden lg:table-cell">Expiración</TableHead>
                <TableHead className="hidden md:table-cell">Audiencia</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead className="text-center">Destacado</TableHead>
                <TableHead className="text-right w-[100px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {announcements.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()).map((ann) => (
                <TableRow key={ann.id}>
                  <TableCell className="hidden md:table-cell text-muted-foreground hover:text-foreground cursor-grab px-2">
                     <GripVertical className="h-5 w-5" />
                  </TableCell>
                  <TableCell className="font-medium max-w-xs truncate" title={ann.title}>{ann.title}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant={getUrgencyBadgeVariant(ann.urgency)}>{ann.urgency}</Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{format(ann.publicationDate, 'dd MMM yyyy', { locale: es })}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {ann.expirationDate ? format(ann.expirationDate, 'dd MMM yyyy', { locale: es }) : <span className="text-muted-foreground">N/A</span>}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {ann.targetAudience.map(aud => (
                        <Badge key={aud} variant="secondary" className="mr-1 mb-1 capitalize">{aud}</Badge>
                    ))}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={ann.isPublished ? 'default' : 'outline'} className={cn(ann.isPublished ? "bg-accent text-accent-foreground hover:bg-accent/90" : "border-foreground/50 text-foreground/70")}>
                      {ann.isPublished ? 'Publicado' : 'Borrador'}
                    </Badge>
                  </TableCell>
                   <TableCell className="text-center">
                     <Badge variant={ann.isSticky ? 'default' : 'outline'} className={cn(ann.isSticky ? "bg-primary text-primary-foreground hover:bg-primary/90" : "border-foreground/50 text-foreground/70")}>
                      {ann.isSticky ? 'Sí' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(ann)} className="hover:text-accent" aria-label="Editar">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteDialog(ann)} className="hover:text-destructive" aria-label="Eliminar">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) handleCloseDialogs(); else setIsCreateDialogOpen(true); }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Anuncio</DialogTitle>
            <DialogDescription>Completa los detalles para el nuevo anuncio.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitOps)}>
            {renderFormFields()}
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={handleCloseDialogs}>Cancelar</Button>
              <Button type="submit">Guardar Anuncio</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) handleCloseDialogs(); else setIsEditDialogOpen(true); }}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Anuncio</DialogTitle>
            <DialogDescription>Modifica los detalles del anuncio seleccionado.</DialogDescription>
          </DialogHeader>
           <form onSubmit={handleSubmit(onSubmitOps)}>
            {renderFormFields()}
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={handleCloseDialogs}>Cancelar</Button>
              <Button type="submit">Guardar Cambios</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(isOpen) => { if (!isOpen) handleCloseDialogs(); else setIsDeleteDialogOpen(true); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás realmente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente el anuncio:
              <br />
              <strong className="text-foreground">"{selectedAnnouncement?.title}"</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseDialogs}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

