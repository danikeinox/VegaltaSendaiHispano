import { z } from "zod";
import type { Dictionary } from "@/i18n/types";
import { COUNTRY_CODES } from "@/lib/countries";

const COUNTRY_CODE_SET = new Set<string>(COUNTRY_CODES);

/** Alineado con atributos Appwrite (setup-appwrite.mjs) y RFC 5321. */
export const FIELD_LIMITS = {
  firstName: 50,
  lastName: 50,
  email: 254,
  displayId: 16,
  country: 56,
} as const;

function nameRegex(maxLength: number) {
  return new RegExp(`^[\\p{L}\\p{M}'\\-\\s.]{1,${maxLength}}$`, "u");
}

export function createRegistrationSchema(v: Dictionary["validation"]) {
  const firstNamePattern = nameRegex(FIELD_LIMITS.firstName);
  const lastNamePattern = nameRegex(FIELD_LIMITS.lastName);

  return z.object({
    firstName: z
      .string()
      .trim()
      .min(1, v.firstNameRequired)
      .max(FIELD_LIMITS.firstName, v.firstNameTooLong)
      .regex(firstNamePattern, v.firstNameInvalid),
    lastName: z
      .string()
      .trim()
      .min(1, v.lastNameRequired)
      .max(FIELD_LIMITS.lastName, v.lastNameTooLong)
      .regex(lastNamePattern, v.lastNameInvalid),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .max(FIELD_LIMITS.email, v.emailTooLong)
      .email(v.emailInvalid),
    country: z
      .string()
      .trim()
      .refine(
        (val) => val === "" || COUNTRY_CODE_SET.has(val),
        v.countryInvalid
      )
      .optional()
      .or(z.literal("")),
    acceptPrivacy: z.boolean().refine((val) => val === true, v.privacyRequired),
  });
}

export type RegistrationInput = z.infer<
  ReturnType<typeof createRegistrationSchema>
>;

export function createRecoverEmailSchema(v: Dictionary["validation"]) {
  return z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .max(FIELD_LIMITS.email, v.emailTooLong)
      .email(v.emailInvalid),
  });
}

export function createMemberLookupSchema(v: Dictionary["validation"]) {
  return z.object({
    displayId: z
      .string()
      .trim()
      .toUpperCase()
      .max(FIELD_LIMITS.displayId, v.displayIdInvalid)
      .regex(/^VS-\d{4,}$/, v.displayIdInvalid),
  });
}
