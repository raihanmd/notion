import { z } from "zod";

export type DeleteBlockDto = z.infer<typeof deleteBlockSchema>;

export const deleteBlockSchema = z.string();
