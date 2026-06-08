import { z } from "zod";

const nameRegex = /^[\p{L}\p{M}'\-\s.]{1,50}$/u;

export const registrationSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(50)
    .regex(nameRegex, "Nombre no válido"),
  lastName: z
    .string()
    .trim()
    .min(1, "El apellido es obligatorio")
    .max(50)
    .regex(nameRegex, "Apellido no válido"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Correo electrónico no válido")
    .max(254),
  country: z
    .string()
    .trim()
    .min(2, "País no válido")
    .max(56)
    .regex(/^[\p{L}\s\-'.]+$/u, "País no válido")
    .optional()
    .or(z.literal("")),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;

export const memberLookupSchema = z.object({
  displayId: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^VS-\d{4,}$/, "ID de socio no válido"),
});
