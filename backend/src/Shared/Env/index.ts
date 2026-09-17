import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.string().default("3000"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_EXPIRES_IN: z.string().default("1d"),
  GOOGLE_MAPS_API_KEY: z.string().optional(),
  // Único e-mail que pode restringir o que outros admins enxergam (esconder nomes
  // de contatos de líderes que não são deles). Nunca configurável por ninguém além
  // de quem tiver acesso a essa variável de ambiente no servidor.
  EMAIL_MASTER: z.string().trim().toLowerCase().default("lucassousarbr@gmail.com"),
  // E-mail do líder cujos compromissos são a agenda do escritório da doutora
  // (mostra o selo "Agenda do escritório" nesses itens da agenda).
  EMAIL_AGENDA_ESCRITORIO: z.string().trim().toLowerCase().default("clepaiva.ap@hotmail.com"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "Invalid environment variables:",
    parsed.error.flatten().fieldErrors
  );
  process.exit(1);
}

export const env = parsed.data;
