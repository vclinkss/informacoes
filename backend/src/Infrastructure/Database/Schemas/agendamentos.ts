import { bigint, bigserial, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { liderTable } from "./lideres";

// Mapeia a tabela "agendamento", criada manualmente via banco/schema.sql no SQL Editor do Supabase.
export const agendamentoTable = pgTable("agendamento", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  liderId: bigint("lider_id", { mode: "number" })
    .notNull()
    .references(() => liderTable.id),
  nome: varchar("nome", { length: 150 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 20 }).notNull(),
  dataHora: timestamp("data_hora", { withTimezone: true }),
  local: varchar("local", { length: 255 }).notNull(),
  observacao: varchar("observacao", { length: 500 }),
  criadoEm: timestamp("criado_em", { withTimezone: true }).defaultNow(),
});
