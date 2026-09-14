import { bigint, bigserial, boolean, doublePrecision, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { liderTable } from "./lideres";

// Mapeia a tabela "contato", criada manualmente via banco/schema.sql no SQL Editor do Supabase.
export const contatoTable = pgTable("contato", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  liderId: bigint("lider_id", { mode: "number" })
    .notNull()
    .references(() => liderTable.id),
  nome: varchar("nome", { length: 150 }).notNull(),
  endereco: varchar("endereco", { length: 255 }).notNull(),
  enderecoLat: doublePrecision("endereco_lat"),
  enderecoLng: doublePrecision("endereco_lng"),
  bairro: varchar("bairro", { length: 100 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 20 }).notNull(),
  localVotacao: varchar("local_votacao", { length: 150 }).notNull(),
  liguei: boolean("liguei").default(false),
  observacao: varchar("observacao", { length: 500 }),
  dataCadastro: timestamp("data_cadastro", { withTimezone: true }).defaultNow(),
});
