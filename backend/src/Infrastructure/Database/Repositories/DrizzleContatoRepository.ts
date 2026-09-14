import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { db } from "../Drizzle/client";
import { contatoTable } from "../Schemas/contatos";
import { liderTable } from "../Schemas/lideres";
import {
  ContagemBairro,
  ContagemLocalVotacao,
  ContatoEdicao,
  ContatoFiltro,
  IContatoRepository,
} from "../../../Application/Contracts/Repositories/IContatoRepository";
import { Contato } from "../../../Domain/Contatos/Models/Contato";

type ContatoRow = {
  id: number;
  liderId: number;
  liderNome: string;
  nome: string;
  endereco: string;
  enderecoLat: number | null;
  enderecoLng: number | null;
  bairro: string;
  whatsapp: string;
  localVotacao: string;
  liguei: boolean | null;
  observacao: string | null;
  dataCadastro: Date | null;
};

function toDomain(row: ContatoRow): Contato {
  return new Contato({
    id: row.id,
    liderId: row.liderId,
    liderNome: row.liderNome,
    nome: row.nome,
    endereco: row.endereco,
    enderecoLat: row.enderecoLat,
    enderecoLng: row.enderecoLng,
    bairro: row.bairro,
    whatsapp: row.whatsapp,
    localVotacao: row.localVotacao,
    liguei: row.liguei ?? false,
    observacao: row.observacao,
    dataCadastro: row.dataCadastro ?? undefined,
  });
}

const contatoComLider = {
  id: contatoTable.id,
  liderId: contatoTable.liderId,
  liderNome: liderTable.nome,
  nome: contatoTable.nome,
  endereco: contatoTable.endereco,
  enderecoLat: contatoTable.enderecoLat,
  enderecoLng: contatoTable.enderecoLng,
  bairro: contatoTable.bairro,
  whatsapp: contatoTable.whatsapp,
  localVotacao: contatoTable.localVotacao,
  liguei: contatoTable.liguei,
  observacao: contatoTable.observacao,
  dataCadastro: contatoTable.dataCadastro,
};

export class DrizzleContatoRepository implements IContatoRepository {
  async create(contato: Contato): Promise<Contato> {
    const [row] = await db
      .insert(contatoTable)
      .values({
        liderId: contato.liderId,
        nome: contato.nome,
        endereco: contato.endereco,
        enderecoLat: contato.enderecoLat,
        enderecoLng: contato.enderecoLng,
        bairro: contato.bairro,
        whatsapp: contato.whatsapp,
        localVotacao: contato.localVotacao,
      })
      .returning();

    return toDomain({ ...row, liderNome: contato.liderNome ?? "" });
  }

  async findAll(filtro: ContatoFiltro = {}): Promise<Contato[]> {
    const condicoes = [];
    if (filtro.liderId !== undefined) condicoes.push(eq(contatoTable.liderId, filtro.liderId));
    if (filtro.busca) condicoes.push(ilike(liderTable.nome, `%${filtro.busca}%`));

    const base = db
      .select(contatoComLider)
      .from(contatoTable)
      .innerJoin(liderTable, eq(contatoTable.liderId, liderTable.id));

    const rows = condicoes.length
      ? await base.where(and(...condicoes)).orderBy(desc(contatoTable.dataCadastro))
      : await base.orderBy(desc(contatoTable.dataCadastro));

    return rows.map(toDomain);
  }

  async updateStatusLigacao(
    id: number,
    liguei: boolean,
    observacao: string | null,
    liderIdRestricao?: number
  ): Promise<Contato | null> {
    const condicao =
      liderIdRestricao !== undefined
        ? and(eq(contatoTable.id, id), eq(contatoTable.liderId, liderIdRestricao))
        : eq(contatoTable.id, id);

    const [row] = await db
      .update(contatoTable)
      .set({ liguei, observacao })
      .where(condicao)
      .returning();
    if (!row) return null;

    const [comLider] = await db
      .select(contatoComLider)
      .from(contatoTable)
      .innerJoin(liderTable, eq(contatoTable.liderId, liderTable.id))
      .where(eq(contatoTable.id, id));

    return toDomain(comLider);
  }

  async update(id: number, dados: ContatoEdicao, liderIdRestricao?: number): Promise<Contato | null> {
    const condicao =
      liderIdRestricao !== undefined
        ? and(eq(contatoTable.id, id), eq(contatoTable.liderId, liderIdRestricao))
        : eq(contatoTable.id, id);

    const valores: Partial<typeof contatoTable.$inferInsert> = {
      nome: dados.nome,
      endereco: dados.endereco,
      bairro: dados.bairro,
      whatsapp: dados.whatsapp,
      localVotacao: dados.localVotacao,
    };
    if (dados.enderecoLat !== undefined) valores.enderecoLat = dados.enderecoLat;
    if (dados.enderecoLng !== undefined) valores.enderecoLng = dados.enderecoLng;

    const [row] = await db.update(contatoTable).set(valores).where(condicao).returning();
    if (!row) return null;

    const [comLider] = await db
      .select(contatoComLider)
      .from(contatoTable)
      .innerJoin(liderTable, eq(contatoTable.liderId, liderTable.id))
      .where(eq(contatoTable.id, id));

    return toDomain(comLider);
  }

  async delete(id: number, liderIdRestricao?: number): Promise<boolean> {
    const condicao =
      liderIdRestricao !== undefined
        ? and(eq(contatoTable.id, id), eq(contatoTable.liderId, liderIdRestricao))
        : eq(contatoTable.id, id);

    const apagados = await db.delete(contatoTable).where(condicao).returning({ id: contatoTable.id });
    return apagados.length > 0;
  }

  async contarPorBairro(liderId?: number): Promise<ContagemBairro[]> {
    const base = db.select({ bairro: contatoTable.bairro, total: sql<number>`count(*)::int` }).from(contatoTable);
    const rows =
      liderId !== undefined
        ? await base.where(eq(contatoTable.liderId, liderId)).groupBy(contatoTable.bairro).orderBy(desc(sql`count(*)`))
        : await base.groupBy(contatoTable.bairro).orderBy(desc(sql`count(*)`));
    return rows;
  }

  async contarPorLocalVotacao(liderId?: number): Promise<ContagemLocalVotacao[]> {
    const base = db
      .select({ localVotacao: contatoTable.localVotacao, total: sql<number>`count(*)::int` })
      .from(contatoTable);
    const rows =
      liderId !== undefined
        ? await base.where(eq(contatoTable.liderId, liderId)).groupBy(contatoTable.localVotacao).orderBy(desc(sql`count(*)`))
        : await base.groupBy(contatoTable.localVotacao).orderBy(desc(sql`count(*)`));
    return rows;
  }
}
