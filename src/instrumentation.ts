export async function register() {
  const { assertProductionSecurityConfig } = await import("@/lib/security/env");
  assertProductionSecurityConfig();
}
