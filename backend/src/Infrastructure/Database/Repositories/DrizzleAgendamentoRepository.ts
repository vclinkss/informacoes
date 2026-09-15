import { and, asc, eq } from "drizzle-orm";
import { db } from "../Drizzle/client";
import { agendamentoTable } from "../Schemas/agendamentos";
import { liderTable } from "../Schemas/lideres";
import {
  AgendamentoEdicao,
  AgendamentoFiltro,
  IAgendamentoRepository,
} from "../../../Application/Contracts/Repositories/IAgendamentoRepository";
import { Agendamento } from "../../../Domain/Agenda/Models/Agendamento";

type AgendamentoRow = {
  id: number;
  liderId: number;
  liderNome: string;
  nome: string;
  whatsapp: string;
  dataHora: Date | null;
  local: string;
  observacao: string | null;
  concluido: boolean | null;
  criadoEm: Date | null;
};

function toDomain(row: AgendamentoRow): Agendamento {
  return new Agendamento({
    id: row.id,
    liderId: row.liderId,
    liderNome: row.liderNome,
    nome: row.nome,
    whatsapp: row.whatsapp,
    dataHora: row.dataHora,
    local: row.local,
    observacao: row.observacao,
    concluido: row.concluido ?? false,
    criadoEm: row.criadoEm ?? undefined,
  });
}

const agendamentoComLider = {
  id: agendamentoTable.id,
  liderId: agendamentoTable.liderId,
  liderNome: liderTable.nome,
  nome: agendamentoTable.nome,
  whatsapp: agendamentoTable.whatsapp,
  dataHora: agendamentoTable.dataHora,
  local: agendamentoTable.local,
  observacao: agendamentoTable.observacao,
  concluido: agendamentoTable.concluido,
  criadoEm: agendamentoTable.criadoEm,
};

export class DrizzleAgendamentoRepository implements IAgendamentoRepository {
  async create(agendamento: Agendamento): Promise<Agendamento> {
    const [row] = await db
      .insert(agendamentoTable)
      .values({
        liderId: agendamento.liderId,
        nome: agendamento.nome,
        whatsapp: agendamento.whatsapp,
        dataHora: agendamento.dataHora,
        local: agendamento.local,
        observacao: agendamento.observacao,
      })
      .returning();

    return toDomain({ ...row, liderNome: agendamento.liderNome ?? "" });
  }

  async findAll(filtro: AgendamentoFiltro = {}): Promise<Agendamento[]> {
    const base = db
      .select(agendamentoComLider)
      .from(agendamentoTable)
      .innerJoin(liderTable, eq(agendamentoTable.liderId, liderTable.id));

    const rows =
      filtro.liderId !== undefined
        ? await base.where(eq(agendamentoTable.liderId, filtro.liderId)).orderBy(asc(agendamentoTable.dataHora))
        : await base.orderBy(asc(agendamentoTable.dataHora));

    return rows.map(toDomain);
  }

  async update(id: number, dados: AgendamentoEdicao, liderIdRestricao?: number): Promise<Agendamento | null> {
    const condicao =
      liderIdRestricao !== undefined
        ? and(eq(agendamentoTable.id, id), eq(agendamentoTable.liderId, liderIdRestricao))
        : eq(agendamentoTable.id, id);

    const [row] = await db
      .update(agendamentoTable)
      .set({
        nome: dados.nome,
        whatsapp: dados.whatsapp,
        dataHora: dados.dataHora,
        local: dados.local,
        observacao: dados.observacao,
        concluido: dados.concluido,
      })
      .where(condicao)
      .returning();
    if (!row) return null;

    const [comLider] = await db
      .select(agendamentoComLider)
      .from(agendamentoTable)
      .innerJoin(liderTable, eq(agendamentoTable.liderId, liderTable.id))
      .where(eq(agendamentoTable.id, id));

    return toDomain(comLider);
  }

  async delete(id: number, liderIdRestricao?: number): Promise<boolean> {
    const condicao =
      liderIdRestricao !== undefined
        ? and(eq(agendamentoTable.id, id), eq(agendamentoTable.liderId, liderIdRestricao))
        : eq(agendamentoTable.id, id);

    const apagados = await db.delete(agendamentoTable).where(condicao).returning({ id: agendamentoTable.id });
    return apagados.length > 0;
  }
}
