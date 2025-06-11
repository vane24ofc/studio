
"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
import { PlusCircle, Edit, Trash2, Calendar as CalendarIcon, GripVertical, Loader2 } from 'lucide-react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";

import { 
  getAnnouncements, 
  createAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement,
  type Announcement as BackendAnnouncement, // Renamed to avoid conflict
  type CreateAnnouncementInput,
  type UpdateAnnouncementInput,
  type UrgencyLevelFlow,
  type TargetAudienceRoleFlow
} from '@/ai/flows/manage-announcements-flow'; // Adjust path as necessary


// Use backend types for consistency
const urgencyLevels: UrgencyLevelFlow[] = ['Normal', 'Importante', 'Urgente', 'Crítico'];

const targetAudienceOptions: { id: TargetAudienceRoleFlow, label: string }[] = [
  { id: 'Administrador', label: 'Administradores' },
  { id: 'Instructor', label: 'Instructores' },
  { id: 'Personal', label: 'Personal' },
  { id: 'Todos', label: 'Todos (General)' },
];

// Frontend interface for state and form (uses Date objects)
interface Announcement {
  id: string;
  title: string;
  content: string;
  urgency: UrgencyLevelFlow;
  publicationDate: Date;
  expirationDate?: Date | null;
  author: string;
  targetAudience: TargetAudienceRoleFlow[];
  isPublished: boolean;
  isSticky: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = z.object({
  title: z.string().min(5, { message: 'El título debe tener al menos 5 caracteres.' }).max(100, { message: 'El título no puede exceder los 100 caracteres.' }),
  content: z.string().min(10, { message: 'El contenido debe tener al menos 10 caracteres.' }),
  urgency: z.enum(urgencyLevels as [UrgencyLevelFlow, ...UrgencyLevelFlow[]], { required_error: 'Debe seleccionar un nivel de urgencia.' }),
  publicationDate: z.date({ required_error: 'La fecha de publicación es obligatoria.' }),
  expirationDate: z.date().nullable().optional(),
  targetAudience: z.array(z.enum(targetAudienceOptions.map(o => o.id) as [TargetAudienceRoleFlow, ...TargetAudienceRoleFlow[]]))
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

// Helper to convert backend announcement (string dates) to frontend (Date objects)
const mapBackendToFrontend = (backendAnn: BackendAnnouncement): Announcement => ({
  ...backendAnn,
  publicationDate: new Date(backendAnn.publicationDate),
  expirationDate: backendAnn.expirationDate ? new Date(backendAnn.expirationDate) : null,
  createdAt: new Date(backendAnn.createdAt),
  updatedAt: new Date(backendAnn.updatedAt),
});

// Helper to convert frontend form data (Date objects) to backend input (string dates)
const mapFrontendToBackendInput = (formData: AnnouncementFormData): Omit<CreateAnnouncementInput, 'author'> => ({
    ...formData,
    publicationDate: formData.publicationDate.toISOString(),
    expirationDate: formData.expirationDate ? formData.expirationDate.toISOString() : null,
});


export default function AdminGestionAnunciosPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchAnnouncements = useCallback(async () => {
    setIsLoading(true);
    try {
      const backendAnnouncements = await getAnnouncements();
      setAnnouncements(backendAnnouncements.map(mapBackendToFrontend));
    } catch (error) {
      console.error("Error fetching announcements:", error);
      toast({
        title: "Error al Cargar Anuncios",
        description: (error as Error).message || "No se pudieron obtener los anuncios del servidor.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);


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
    const currentAudience = watchedTargetAudience || [];
    if (currentAudience.includes('Todos') && currentAudience.length > 1) {
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
      isPublished: true,
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
      publicationDate: announcement.publicationDate, // Already a Date object
      expirationDate: announcement.expirationDate, // Already a Date or null
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

  const onSubmitOps: SubmitHandler<AnnouncementFormData> = async (data) => {
    setIsSubmitting(true);
    const finalAudience = data.targetAudience.includes('Todos') ? ['Todos'] : data.targetAudience;
    const dataForBackend = {
      ...data,
      publicationDate: data.publicationDate.toISOString(),
      expirationDate: data.expirationDate ? data.expirationDate.toISOString() : null,
      targetAudience: finalAudience,
    };

    try {
      if (selectedAnnouncement && isEditDialogOpen) { // Editing
        const updateData: UpdateAnnouncementInput = dataForBackend;
        await updateAnnouncement(selectedAnnouncement.id, updateData);
        toast({ title: "Anuncio Actualizado", description: "El anuncio se ha actualizado correctamente." });
      } else { // Creating
        const createData: CreateAnnouncementInput = dataForBackend;
        await createAnnouncement(createData);
        toast({ title: "Anuncio Creado", description: "El nuevo anuncio se ha guardado correctamente." });
      }
      await fetchAnnouncements(); // Refresh list
      handleCloseDialogs();
    } catch (error) {
      console.error("Error saving announcement:", error);
      toast({
        title: "Error al Guardar",
        description: (error as Error).message || "No se pudo guardar el anuncio.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAnnouncement) return;
    setIsSubmitting(true);
    try {
      await deleteAnnouncement(selectedAnnouncement.id);
      toast({ title: "Anuncio Eliminado", description: "El anuncio ha sido eliminado." });
      await fetchAnnouncements(); // Refresh list
      handleCloseDialogs();
    } catch (error) {
      console.error("Error deleting announcement:", error);
      toast({
        title: "Error al Eliminar",
        description: (error as Error).message || "No se pudo eliminar el anuncio.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUrgencyBadgeVariant = (urgency: UrgencyLevelFlow): "default" | "secondary" | "destructive" | "outline" => {
    switch (urgency) {
      case 'Crítico': return 'destructive';
      case 'Urgente': return 'destructive'; // Kept 'Urgente' as destructive for emphasis
      case 'Importante': return 'secondary'; // 'Importante' as secondary (yellowish in some themes)
      default: return 'outline'; // 'Normal' as outline
    }
  };

  const renderFormFields = () => (
    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="title" className="text-right">Título</Label>
        <Input id="title" {...form.register("title")} className="col-span-3" disabled={isSubmitting} />
      </div>
      {errors.title && <p className="col-start-2 col-span-3 text-sm text-destructive">{errors.title.message}</p>}

      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="content" className="text-right pt-2">Contenido</Label>
        <Textarea id="content" {...form.register("content")} className="col-span-3 min-h-[100px]" disabled={isSubmitting} />
      </div>
       {errors.content && <p className="col-start-2 col-span-3 text-sm text-destructive">{errors.content.message}</p>}

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="urgency" className="text-right">Urgencia</Label>
        <Controller
          name="urgency"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value} disabled={isSubmitting}>
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
                  disabled={isSubmitting}
                  className={cn("col-span-3 justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus disabled={isSubmitting} />
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
                  disabled={isSubmitting}
                  className={cn("col-span-3 justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {field.value ? format(field.value, "PPP", { locale: es }) : <span>Seleccionar fecha (opcional)</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={field.value || undefined} onSelect={field.onChange} initialFocus disabled={isSubmitting}/>
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
                const isTodosSelected = field.value?.includes('Todos');
                const isDisabledByTodos = isTodosSelected && option.id !== 'Todos';
                
                return (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`audience-${option.id}`}
                      checked={isChecked}
                      disabled={isSubmitting || isDisabledByTodos}
                      onCheckedChange={(checked) => {
                        let newValue = [...(field.value || [])];
                        if (option.id === 'Todos') {
                          newValue = checked ? ['Todos'] : [];
                        } else {
                          if (checked) {
                            if (!newValue.includes(option.id)) newValue.push(option.id);
                            newValue = newValue.filter(id => id !== 'Todos'); // Unselect 'Todos' if specific role is selected
                          } else {
                            newValue = newValue.filter(id => id !== option.id);
                          }
                        }
                        field.onChange(newValue);
                      }}
                    />
                    <label
                      htmlFor={`audience-${option.id}`}
                      className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed", (isSubmitting || isDisabledByTodos) ? "text-muted-foreground opacity-70" : "peer-disabled:opacity-70")}
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
                        <Checkbox id="isPublished" checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} />
                        <Label htmlFor="isPublished">Publicar Anuncio</Label>
                    </div>
                )}
            />
            <Controller
                name="isSticky"
                control={control}
                render={({ field }) => (
                    <div className="flex items-center space-x-2">
                        <Checkbox id="isSticky" checked={field.value} onCheckedChange={field.onChange} disabled={isSubmitting} />
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
          <Button onClick={handleOpenCreateDialog} disabled={isLoading || isSubmitting}>
            <PlusCircle className="mr-2 h-5 w-5" />
            Crear Anuncio
          </Button>
        }
      />

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
             <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          ) : (
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
                  <TableCell className="font-medium max-w-[200px] sm:max-w-xs truncate" title={ann.title}>{ann.title}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant={getUrgencyBadgeVariant(ann.urgency)}>{ann.urgency}</Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{format(ann.publicationDate, 'dd MMM yyyy', { locale: es })}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {ann.expirationDate ? format(ann.expirationDate, 'dd MMM yyyy', { locale: es }) : <span className="text-muted-foreground">N/A</span>}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {ann.targetAudience.map(aud => (
                        <Badge key={aud} variant="secondary" className="mr-1 mb-1 capitalize">{aud === 'Todos' ? 'General' : aud}</Badge>
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
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEditDialog(ann)} className="hover:text-accent" aria-label="Editar" disabled={isSubmitting}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteDialog(ann)} className="hover:text-destructive" aria-label="Eliminar" disabled={isSubmitting}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          )}
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
              <Button type="button" variant="outline" onClick={handleCloseDialogs} disabled={isSubmitting}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Anuncio
              </Button>
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
              <Button type="button" variant="outline" onClick={handleCloseDialogs} disabled={isSubmitting}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>
                 {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Guardar Cambios
              </Button>
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
            <AlertDialogCancel onClick={handleCloseDialogs} disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
                onClick={handleDeleteConfirm} 
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
