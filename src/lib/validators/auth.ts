import { z } from "zod";

/** Nigerian mobile, local format: 0[7-9][01] + 8 digits. Spaces are ignored. */
const NG_MOBILE = /^0[7-9][01]\d{8}$/;
const EMAIL = z.string().email();

export const signInSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, "Enter your phone number or email")
    .refine(
      (v) => EMAIL.safeParse(v).success || NG_MOBILE.test(v.replace(/\s+/g, "")),
      "Enter a valid email or Nigerian mobile number (e.g. 0803 456 7890)",
    ),
  password: z.string().min(1, "Enter your password"),
  remember: z.boolean(),
});

export const signUpSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Enter your full name")
    .refine((v) => v.split(/\s+/).length >= 2, "Enter your first and last name"),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .refine((v) => NG_MOBILE.test(v.replace(/\s+/g, "")), "Enter a valid Nigerian mobile number (e.g. 0802 345 6789)"),
  region: z.enum(["lagos-island", "lagos-mainland"]),
  password: z.string().min(8, "Password must be at least 8 characters"),
  marketing: z.boolean(),
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
