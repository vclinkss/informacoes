import { AppError } from "../../../Contracts/Errors/AppError";
import { ILiderRepository } from "../../../Contracts/Repositories/ILiderRepository";
import { Lider } from "../../../../Domain/Lideres/Models/Lider";

export class AtualizarRestricaoLider {
  constructor(private readonly liderRepository: ILiderRepository) {}

  async execute(input: { id: number; restrito: boolean }): Promise<Lider> {
    const atualizado = await this.liderRepository.updateRestrito(input.id, input.restrito);
    if (!atualizado) throw new AppError("Líder não encontrado", 404);
    return atualizado;
  }
}
