import { z } from "zod";

export const SignupSchema = z.object({
  email: z
    .email({ message: "Email is required" })
    .max(255, { message: "Email cannot be longer than 255 characters" }),
  password: z
    .string()
    .min(8, "Password should be at least 8 characters")
    .max(64, "Password cannot be longer then 64 characters")
    .refine((data) => /[A-Z]/.test(data), {
      message: "Atleast one uppercase letter is required",
    })
    .refine((data) => /[!@#$%^&*(),.?":{}|<>]/.test(data), {
      message: "Atleast one special letter is required",
    }),
  username: z
    .string()
    .min(3, "Username should be at least 3 characters")
    .max(64, "Username cannot be longer than 64 characters"),
});

export type SignupSchemaType = z.infer<typeof SignupSchema>;

export const SigninSchema = SignupSchema.pick({
  email: true,
}).extend({
  password: z
    .string()
    .min(8, "Password should be at least 8 characters")
    .max(64, "Password cannot be longer then 64 characters"),
});
export type SigninSchemaType = z.infer<typeof SigninSchema>;
