import { eq, sql } from "drizzle-orm";
import { db } from "../Drizzle/client";
import { localGeoTable } from "../Schemas/geoCache";
import {
  IGeoCacheRepository,
  PontoNomeadoCache,
  TipoLocalGeo,
} from "../../../Application/Contracts/Repositories/IGeoCacheRepository";
import { PontoGeografico } from "../../../Application/Contracts/Geocoding/IGeocoder";

export class DrizzleGeoCacheRepository implements IGeoCacheRepository {
  async obter(nome: string): Promise<PontoGeografico | null> {
    // Ignora maiúscula/minúscula e espaços nas pontas: "Centro", "centro" e " Centro "
    // contam como o mesmo lugar, pra não multiplicar correções por variação de digitação.
    const [row] = await db
      .select()
      .from(localGeoTable)
      .where(sql`lower(trim(${localGeoTable.nome})) = lower(trim(${nome}))`);
    return row ? { lat: row.lat, lng: row.lng } : null;
  }

  async salvar(nome: string, ponto: PontoGeografico, tipo?: TipoLocalGeo): Promise<void> {
    // Se já existir uma variação (case/espaço diferente) desse nome, atualiza ela em vez de criar outra linha.
    const [existente] = await db
      .select({ nome: localGeoTable.nome })
      .from(localGeoTable)
      .where(sql`lower(trim(${localGeoTable.nome})) = lower(trim(${nome}))`);

    if (existente) {
      await db
        .update(localGeoTable)
        .set({ lat: ponto.lat, lng: ponto.lng, ...(tipo ? { tipo } : {}) })
        .where(eq(localGeoTable.nome, existente.nome));
      return;
    }

    await db.insert(localGeoTable).values({ nome, lat: ponto.lat, lng: ponto.lng, tipo });
  }

  async listarPorTipo(tipo: TipoLocalGeo): Promise<PontoNomeadoCache[]> {
    const rows = await db.select().from(localGeoTable).where(eq(localGeoTable.tipo, tipo)).orderBy(localGeoTable.nome);
    return rows.map((row) => ({ nome: row.nome, lat: row.lat, lng: row.lng }));
  }
}
