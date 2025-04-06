import { z } from "zod";

export type ReorderBlockDto = z.infer<typeof reorderBlocksSchema>;

export const reorderBlocksSchema = z.array(
  z.object({
    id: z.string(),
    position: z.number(),
    parentId: z.string().nullable().optional(),
  }),
);
