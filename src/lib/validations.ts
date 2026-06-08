import { z } from "zod";
import type { Dictionary } from "@/i18n/types";

const nameRegex = /^[\p{L}\p{M}'\-\s.]{1,50}$/u;

export function createRegistrationSchema(v: Dictionary["validation"]) {
  return z.object({
    firstName: z
      .string()
      .trim()
      .min(1, v.firstNameRequired)
      .max(50)
      .regex(nameRegex, v.firstNameInvalid),
    lastName: z
      .string()
      .trim()
      .min(1, v.lastNameRequired)
      .max(50)
      .regex(nameRegex, v.lastNameInvalid),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email(v.emailInvalid)
      .max(254),
    country: z
      .string()
      .trim()
      .min(2, v.countryInvalid)
      .max(56)
      .regex(/^[\p{L}\s\-'.]+$/u, v.countryInvalid)
      .optional()
      .or(z.literal("")),
  });
}

export type RegistrationInput = z.infer<
  ReturnType<typeof createRegistrationSchema>
>;

export function createMemberLookupSchema(v: Dictionary["validation"]) {
  return z.object({
    displayId: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^VS-\d{4,}$/, v.displayIdInvalid),
  });
}
