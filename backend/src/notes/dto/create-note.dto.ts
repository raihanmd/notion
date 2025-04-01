import { z } from "zod";

export class CreateNoteDto implements z.infer<typeof createNoteSchema> {
  title!: string;
  content!: string;
  parent_id?: string;
  image?: string;
  icon?: string;
  is_published?: boolean;
}

export const createNoteSchema = z.object({
  title: z.string(),
  content: z.string(),
  parent_id: z.string().optional(),
  image: z.string().optional(),
  icon: z.string().optional(),
  is_published: z.boolean().optional(),
});
