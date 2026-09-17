import { env } from "./Env";

/** Identifica os compromissos que são da agenda do escritório da doutora. */
export function ehAgendaEscritorio(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === env.EMAIL_AGENDA_ESCRITORIO;
}
