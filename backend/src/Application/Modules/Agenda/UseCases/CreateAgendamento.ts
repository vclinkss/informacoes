import { IAgendamentoRepository } from "../../../Contracts/Repositories/IAgendamentoRepository";
import { Agendamento } from "../../../../Domain/Agenda/Models/Agendamento";

export type CreateAgendamentoInput = {
  liderId: number;
  liderNome: string;
  nome: string;
  whatsapp: string;
  dataHora: Date;
  local: string;
  observacao?: string | null;
};

export class CreateAgendamento {
  constructor(private readonly agendamentoRepository: IAgendamentoRepository) {}

  async execute(input: CreateAgendamentoInput): Promise<Agendamento> {
    const agendamento = new Agendamento({
      liderId: input.liderId,
      liderNome: input.liderNome,
      nome: input.nome.trim(),
      whatsapp: input.whatsapp.trim(),
      dataHora: input.dataHora,
      local: input.local.trim(),
      observacao: input.observacao?.trim() || null,
    });

    return this.agendamentoRepository.create(agendamento);
  }
}
