import { Agendamento } from "../../../Domain/Agenda/Models/Agendamento";

export type AgendamentoFiltro = {
  /** Restringe aos agendamentos de um líder específico (líder comum só vê os seus). */
  liderId?: number;
};

export type AgendamentoEdicao = {
  nome?: string;
  whatsapp?: string;
  dataHora?: Date | null;
  local?: string;
  observacao?: string | null;
  concluido?: boolean;
};

export interface IAgendamentoRepository {
  create(agendamento: Agendamento): Promise<Agendamento>;
  findAll(filtro?: AgendamentoFiltro): Promise<Agendamento[]>;
  update(id: number, dados: AgendamentoEdicao, liderIdRestricao?: number): Promise<Agendamento | null>;
  delete(id: number, liderIdRestricao?: number): Promise<boolean>;
}
