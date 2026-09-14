import { AppError } from "../../../Contracts/Errors/AppError";
import { AgendamentoEdicao, IAgendamentoRepository } from "../../../Contracts/Repositories/IAgendamentoRepository";
import { Agendamento } from "../../../../Domain/Agenda/Models/Agendamento";

export class UpdateAgendamento {
  constructor(private readonly agendamentoRepository: IAgendamentoRepository) {}

  async execute(input: { id: number; dados: AgendamentoEdicao; liderIdRestricao?: number }): Promise<Agendamento> {
    const atualizado = await this.agendamentoRepository.update(input.id, input.dados, input.liderIdRestricao);
    if (!atualizado) throw new AppError("Agendamento não encontrado", 404);
    return atualizado;
  }
}
