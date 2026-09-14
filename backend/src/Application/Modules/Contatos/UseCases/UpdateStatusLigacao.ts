import { AppError } from "../../../Contracts/Errors/AppError";
import { IContatoRepository } from "../../../Contracts/Repositories/IContatoRepository";
import { Contato } from "../../../../Domain/Contatos/Models/Contato";

export class UpdateStatusLigacao {
  constructor(private readonly contatoRepository: IContatoRepository) {}

  async execute(input: {
    id: number;
    liguei: boolean;
    observacao: string | null;
    liderIdRestricao?: number;
  }): Promise<Contato> {
    const atualizado = await this.contatoRepository.updateStatusLigacao(
      input.id,
      input.liguei,
      input.observacao,
      input.liderIdRestricao
    );
    if (!atualizado) throw new AppError("Contato não encontrado", 404);
    return atualizado;
  }
}
