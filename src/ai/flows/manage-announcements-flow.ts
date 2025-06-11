
'use server';
/**
 * @fileOverview Manages announcements for the platform.
 *
 * - createAnnouncement - Creates a new announcement.
 * - getAnnouncements - Retrieves all announcements.
 * - updateAnnouncement - Updates an existing announcement.
 * - deleteAnnouncement - Deletes an announcement.
 * - AnnouncementSchema - Zod schema for an announcement.
 * - CreateAnnouncementInputSchema - Zod schema for creating an announcement.
 * - UpdateAnnouncementInputSchema - Zod schema for updating an announcement.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit/zod';
import type { UserRole as AppUserRole } from '@/types';


// Extended UserRole for 'Todos' in target audience
const targetAudienceRoleOptions = ['Administrador', 'Instructor', 'Personal', 'Todos'] as const;
export type TargetAudienceRoleFlow = (typeof targetAudienceRoleOptions)[number];


const UrgencyLevelOptions = ['Normal', 'Importante', 'Urgente', 'Crítico'] as const;
export type UrgencyLevelFlow = (typeof UrgencyLevelOptions)[number];

export const AnnouncementSchema = z.object({
  id: z.string().describe('Unique identifier for the announcement.'),
  title: z.string().min(5).max(100).describe('Title of the announcement.'),
  content: z.string().min(10).describe('Main content of the announcement.'),
  urgency: z.enum(UrgencyLevelOptions).describe('Urgency level of the announcement.'),
  publicationDate: z.string().datetime().describe('Date and time when the announcement is published. ISO 8601 format.'),
  expirationDate: z.string().datetime().nullish().describe('Optional date and time when the announcement expires. ISO 8601 format.'),
  author: z.string().describe('Author of the announcement (e.g., user ID or name).'),
  targetAudience: z.array(z.enum(targetAudienceRoleOptions)).min(1).describe('Array of roles the announcement is targeted at.'),
  isPublished: z.boolean().describe('Whether the announcement is currently visible to users.'),
  isSticky: z.boolean().describe('Whether the announcement should be pinned or highlighted.'),
  createdAt: z.string().datetime().describe('Timestamp of when the announcement was created. ISO 8601 format.'),
  updatedAt: z.string().datetime().describe('Timestamp of when the announcement was last updated. ISO 8601 format.'),
});
export type Announcement = z.infer<typeof AnnouncementSchema>;

export const CreateAnnouncementInputSchema = AnnouncementSchema.omit({ 
    id: true, 
    author: true, // Will be set by the server/logged-in user context
    createdAt: true, 
    updatedAt: true 
});
export type CreateAnnouncementInput = z.infer<typeof CreateAnnouncementInputSchema>;

export const UpdateAnnouncementInputSchema = AnnouncementSchema.omit({ 
    author: true, // Should not be changed on update by input
    createdAt: true, // Should not be changed on update
    updatedAt: true // Will be set by the server
}).partial(); // All fields are optional for update
export type UpdateAnnouncementInput = z.infer<typeof UpdateAnnouncementInputSchema>;


// In-memory store for announcements (replace with a database in a real application)
let announcementsStore: Announcement[] = [
  {
    id: 'ann-1-initial',
    title: 'Mantenimiento Programado del Sistema (Desde Backend)',
    content: 'El sistema estará en mantenimiento este domingo de 02:00 a 04:00 AM. Este anuncio viene del backend.',
    urgency: 'Urgente',
    publicationDate: new Date('2024-07-28T10:00:00Z').toISOString(),
    expirationDate: new Date('2024-07-29T10:00:00Z').toISOString(),
    author: 'Admin Sistema Backend',
    targetAudience: ['Todos'],
    isPublished: true,
    isSticky: true,
    createdAt: new Date('2024-07-20T10:00:00Z').toISOString(),
    updatedAt: new Date('2024-07-20T10:00:00Z').toISOString(),
  },
  {
    id: 'ann-2-initial',
    title: 'Nueva Política de Vacaciones 2024 (Desde Backend)',
    content: 'Se ha actualizado la política de vacaciones. Por favor, revísenla en la sección de documentos. Este anuncio viene del backend.',
    urgency: 'Importante',
    publicationDate: new Date('2024-07-25T00:00:00Z').toISOString(),
    expirationDate: null,
    author: 'Recursos Humanos Backend',
    targetAudience: ['Personal', 'Instructor'],
    isPublished: true,
    isSticky: false,
    createdAt: new Date('2024-07-22T00:00:00Z').toISOString(),
    updatedAt: new Date('2024-07-22T00:00:00Z').toISOString(),
  },
];


// Flow for creating an announcement
const createAnnouncementFlow = ai.defineFlow(
  {
    name: 'createAnnouncementFlow',
    inputSchema: CreateAnnouncementInputSchema,
    outputSchema: AnnouncementSchema,
  },
  async (input) => {
    const now = new Date().toISOString();
    const newAnnouncement: Announcement = {
      ...input,
      id: `ann-${Date.now()}-${Math.random().toString(36).substring(7)}`, // Simple unique ID
      author: 'Usuario Actual (Backend)', // Replace with actual user context later
      publicationDate: new Date(input.publicationDate).toISOString(),
      expirationDate: input.expirationDate ? new Date(input.expirationDate).toISOString() : null,
      createdAt: now,
      updatedAt: now,
    };
    announcementsStore.unshift(newAnnouncement); // Add to the beginning of the array
    return newAnnouncement;
  }
);

export async function createAnnouncement(input: CreateAnnouncementInput): Promise<Announcement> {
  return createAnnouncementFlow(input);
}


// Flow for getting all announcements
const getAnnouncementsFlow = ai.defineFlow(
  {
    name: 'getAnnouncementsFlow',
    inputSchema: z.undefined(), // No input needed to get all
    outputSchema: z.array(AnnouncementSchema),
  },
  async () => {
    // Return a sorted copy (newest first)
    return [...announcementsStore].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
);

export async function getAnnouncements(): Promise<Announcement[]> {
  return getAnnouncementsFlow();
}

// Flow for updating an announcement
const updateAnnouncementFlow = ai.defineFlow(
  {
    name: 'updateAnnouncementFlow',
    inputSchema: z.object({ 
        id: z.string(), 
        data: UpdateAnnouncementInputSchema 
    }),
    outputSchema: AnnouncementSchema,
  },
  async ({ id, data }) => {
    const announcementIndex = announcementsStore.findIndex(ann => ann.id === id);
    if (announcementIndex === -1) {
      throw new Error(`Announcement with id ${id} not found.`);
    }
    const updatedAnnouncement: Announcement = {
      ...announcementsStore[announcementIndex],
      ...data,
      publicationDate: data.publicationDate ? new Date(data.publicationDate).toISOString() : announcementsStore[announcementIndex].publicationDate,
      expirationDate: data.expirationDate !== undefined // Check if expirationDate is explicitly passed
                        ? (data.expirationDate ? new Date(data.expirationDate).toISOString() : null) 
                        : announcementsStore[announcementIndex].expirationDate,
      updatedAt: new Date().toISOString(),
    };
    announcementsStore[announcementIndex] = updatedAnnouncement;
    return updatedAnnouncement;
  }
);

export async function updateAnnouncement(id: string, data: UpdateAnnouncementInput): Promise<Announcement> {
  return updateAnnouncementFlow({ id, data });
}

// Flow for deleting an announcement
const deleteAnnouncementFlow = ai.defineFlow(
  {
    name: 'deleteAnnouncementFlow',
    inputSchema: z.object({ id: z.string() }),
    outputSchema: z.object({ success: z.boolean(), id: z.string() }),
  },
  async ({ id }) => {
    const initialLength = announcementsStore.length;
    announcementsStore = announcementsStore.filter(ann => ann.id !== id);
    if (announcementsStore.length === initialLength) {
        throw new Error(`Announcement with id ${id} not found for deletion.`);
    }
    return { success: true, id };
  }
);

export async function deleteAnnouncement(id: string): Promise<{ success: boolean; id: string }> {
  return deleteAnnouncementFlow({ id });
}
