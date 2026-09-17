import { bigserial, boolean, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

// Mapeia a tabela "lider", criada/alterada manualmente via banco/schema.sql no SQL Editor do Supabase.
// Este projeto não usa drizzle-kit migrate contra este schema (fonte da verdade é banco/schema.sql).
export const liderTable = pgTable("lider", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  nome: varchar("nome", { length: 150 }).notNull(),
  email: varchar("email", { length: 180 }).notNull(),
  senhaHash: varchar("senha_hash", { length: 255 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("lider"),
  status: varchar("status", { length: 20 }).notNull().default("pendente"),
  restrito: boolean("restrito").notNull().default(false),
  criadoEm: timestamp("criado_em", { withTimezone: true }).defaultNow(),
});
