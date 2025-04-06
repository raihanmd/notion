import { z } from "zod";

export const createBlockValidationSchema = z.object({
  note_id: z.string(),
  parent_id: z.string().nullable().optional(),
  type: z.string(),
  content: z.string(),
  props: z.string().optional(),
  position: z.number(),
});

export const reorderBlocksValidationSchema = z.array(
  z.object({
    id: z.string(),
    position: z.number(),
    parentId: z.string().nullable().optional(),
  }),
);

export const updateBlockValidationSchema = createBlockValidationSchema.extend({
  id: z.string(),
});

const getBlockValidationSchema = z.object({
  id: z.string().uuid(),
});

export type TCreateBlock = z.infer<typeof createBlockValidationSchema>;

export type TUpdateBlock = z.infer<typeof updateBlockValidationSchema>;

export type TReorderBlocks = z.infer<typeof reorderBlocksValidationSchema>;

export type TGetBlock = z.infer<typeof getBlockValidationSchema>;
