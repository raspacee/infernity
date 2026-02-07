import { z } from "zod";

export const SignupSchema = z.object({
  email: z
    .email({ message: "Valid email is required" })
    .max(255, { message: "Email cannot be longer than 255 characters" }),
  password: z
    .string()
    .min(8, "Password should be at least 8 characters")
    .max(64, "Password cannot be longer then 64 characters"),
  username: z
    .string()
    .min(3, "Username should be at least 3 characters")
    .max(64, "Username cannot be longer than 64 characters"),
});

export type SignupSchemaType = z.infer<typeof SignupSchema>;

export const LoginSchema = SignupSchema.pick({
  email: true,
}).extend({
  password: z
    .string()
    .min(8, "Password should be at least 8 characters")
    .max(64, "Password cannot be longer then 64 characters"),
});
export type LoginSchemaType = z.infer<typeof LoginSchema>;
