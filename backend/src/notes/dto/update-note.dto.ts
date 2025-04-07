import { CreateNoteDto, createNoteSchema } from "./create-note.dto";
import { z } from "zod";
import { SharePolicy } from "@prisma/client";

export type UpdateNoteDto = Partial<CreateNoteDto> &
  z.infer<typeof updateNoteSchema>;

export const updateNoteSchema = createNoteSchema.extend({
  share_policy: z.nativeEnum(SharePolicy).optional(),
});
