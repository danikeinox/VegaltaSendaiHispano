function isDisabledFlag(value: string | undefined): boolean {
  if (!value) return true;
  return value.trim().toLowerCase() !== "false";
}

/** Registro deshabilitado temporalmente por medidas de seguridad (servidor). */
export function isRegistrationDisabled(): boolean {
  return isDisabledFlag(process.env.REGISTRATION_DISABLED);
}

/** Misma comprobación en componentes cliente (build-time). */
export function isRegistrationDisabledClient(): boolean {
  return isDisabledFlag(process.env.NEXT_PUBLIC_REGISTRATION_DISABLED);
}
