import { z } from "zod";
import type { Dictionary } from "@/i18n/types";
import { COUNTRY_CODES } from "@/lib/countries";

const COUNTRY_CODE_SET = new Set<string>(COUNTRY_CODES);

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
      .refine(
        (val) => val === "" || COUNTRY_CODE_SET.has(val),
        v.countryInvalid
      )
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
