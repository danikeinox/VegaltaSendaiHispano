/** URL pública de Buy Me a Coffee (ej. https://buymeacoffee.com/tuusuario) */
export function getBuyMeACoffeeUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_BUYMEACOFFEE_URL?.trim();
  return url || null;
}

export function isSupportConfigured(): boolean {
  return getBuyMeACoffeeUrl() !== null;
}
