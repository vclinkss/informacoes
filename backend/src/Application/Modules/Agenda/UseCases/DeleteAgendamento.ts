import { AppError } from "../../../Contracts/Errors/AppError";
import { IAgendamentoRepository } from "../../../Contracts/Repositories/IAgendamentoRepository";

export class DeleteAgendamento {
  constructor(private readonly agendamentoRepository: IAgendamentoRepository) {}

  async execute(input: { id: number; liderIdRestricao?: number }): Promise<void> {
    const apagou = await this.agendamentoRepository.delete(input.id, input.liderIdRestricao);
    if (!apagou) throw new AppError("Agendamento não encontrado", 404);
  }
}
