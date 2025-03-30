import { z } from "zod";

export const authSchema = z.object({
  username: z
    .string()
    .min(3, "username must contain at least 3 characters")
    .max(20, "username maximum 20 characters"),
  password: z.string().min(6, "password must contain at least 6 characters"),
});
