import { bigserial, doublePrecision, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

// Cache de geocodificação (nome do bairro/escola -> lat/lng), pra não
// bater no Nominatim de novo pra um nome já resolvido antes.
export const localGeoTable = pgTable("local_geo", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  nome: varchar("nome", { length: 200 }).notNull().unique(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  tipo: varchar("tipo", { length: 20 }),
  criadoEm: timestamp("criado_em", { withTimezone: true }).defaultNow(),
});
