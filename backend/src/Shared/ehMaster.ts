import { env } from "./Env";

/** Único e-mail que pode conceder/revogar a restrição de outros admins. */
export function ehMaster(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === env.EMAIL_MASTER;
}
