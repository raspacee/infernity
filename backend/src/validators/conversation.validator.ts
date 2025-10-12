import { z } from "zod";

export const updateConversationSchema = z
  .object({
    title: z
      .string()
      .min(1)
      .max(500)
      .transform((s) => s.trim())
      .optional(),
  })
  .refine((obj) => Object.keys(obj).length > 0, {
    message: "No valid fields provided to update",
  });

export type UpdateConversationFields = z.infer<typeof updateConversationSchema>;
