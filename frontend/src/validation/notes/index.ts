import { z } from "zod";

const getNotesValidationSchema = z.object({
  id: z.string().uuid(),
});

const createNotesValidationSchema = z.object({
  title: z
    .string()
    .min(3, "title must contain at least 3 characters")
    .default("Untitled"),
  content: z.string().min(3, "content must contain at least 3 characters"),
  parent_id: z.string().optional(),
  image: z.string().optional(),
  icon: z.string().optional(),
  is_archived: z.boolean().optional(),
  is_published: z.boolean().optional(),
  share_policy: z.string().optional(),
});

const queryParamsNotesValidationSchema = z.object({
  search: z.string().optional(),
});

export type TCreateNotes = z.infer<typeof createNotesValidationSchema>;

export type TUpdateNotes = Partial<z.infer<typeof createNotesValidationSchema>>;

export type TGetNotesParams = z.infer<typeof getNotesValidationSchema>;

export type TQueryParamsNotes = z.infer<
  typeof queryParamsNotesValidationSchema
>;
