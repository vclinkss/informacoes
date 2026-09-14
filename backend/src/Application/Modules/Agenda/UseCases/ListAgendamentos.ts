import { IAgendamentoRepository } from "../../../Contracts/Repositories/IAgendamentoRepository";
import { Agendamento } from "../../../../Domain/Agenda/Models/Agendamento";

export class ListAgendamentos {
  constructor(private readonly agendamentoRepository: IAgendamentoRepository) {}

  async execute(input: { liderId?: number } = {}): Promise<Agendamento[]> {
    return this.agendamentoRepository.findAll({ liderId: input.liderId });
  }
}
