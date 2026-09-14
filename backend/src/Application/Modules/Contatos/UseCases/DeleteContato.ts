import { AppError } from "../../../Contracts/Errors/AppError";
import { IContatoRepository } from "../../../Contracts/Repositories/IContatoRepository";

export class DeleteContato {
  constructor(private readonly contatoRepository: IContatoRepository) {}

  async execute(input: { id: number; liderIdRestricao?: number }): Promise<void> {
    const apagou = await this.contatoRepository.delete(input.id, input.liderIdRestricao);
    if (!apagou) throw new AppError("Contato não encontrado", 404);
  }
}
