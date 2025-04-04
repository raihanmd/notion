import { z } from "zod";

export class QueryParamsNoteDto
  implements z.infer<typeof queryParamsNoteSchema>
{
  search?: string;
}

export const queryParamsNoteSchema = z.object({
  search: z.string().optional(),
});
