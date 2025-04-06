import { createBlockSchema } from "./create-block.dto";
import { z } from "zod";

export class UpdateBlockDto implements z.infer<typeof updateBlockSchema> {
  id!: string;
  note_id!: string;
  parent_id?: string;
  type!: string;
  content!: string;
  props?: string;
  position!: number;
}

export const updateBlockSchema = createBlockSchema.extend({
  id: z.string(),
});
