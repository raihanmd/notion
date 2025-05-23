import { z } from "zod";

export class CreateBlockDto implements z.infer<typeof createBlockSchema> {
  id!: string;
  content!: string;
  props?: string;
  note_id!: string;
  parent_id?: string;
  type!: string;
  position!: number;
}

export const createBlockSchema = z.object({
  id: z.string(),
  note_id: z.string(),
  parent_id: z.string().nullable().optional(),
  type: z.string(),
  content: z.string(),
  props: z.string().optional(),
  position: z.number(),
});
