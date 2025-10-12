import { z } from "zod";

export const updateConversationSchema = z
  .object({
    title: z
      .string()
      .min(1, { error: "Title is required" })
      .max(500, { error: "Title length should be less than 500 characters" })
      .transform((s) => s.trim())
      .optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "No valid fields provided to update",
  });

export type UpdateConversationFields = z.infer<typeof updateConversationSchema>;
