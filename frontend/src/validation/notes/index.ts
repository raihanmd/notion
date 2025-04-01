import { z } from "zod";

export const createNotesValidationSchema = z.object({
  title: z
    .string()
    .min(3, "title must contain at least 3 characters")
    .default("Untitled"),
  content: z.string().min(3, "content must contain at least 3 characters"),
});

export type TCreateNotes = z.infer<typeof createNotesValidationSchema>;
