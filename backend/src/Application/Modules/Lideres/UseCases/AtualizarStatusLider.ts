import { AppError } from "../../../Contracts/Errors/AppError";
import { ILiderRepository } from "../../../Contracts/Repositories/ILiderRepository";
import { Lider, LiderStatus } from "../../../../Domain/Lideres/Models/Lider";

export class AtualizarStatusLider {
  constructor(private readonly liderRepository: ILiderRepository) {}

  async execute(input: { id: number; status: LiderStatus }): Promise<Lider> {
    const atualizado = await this.liderRepository.updateStatus(input.id, input.status);
    if (!atualizado) throw new AppError("Líder não encontrado", 404);
    return atualizado;
  }
}
