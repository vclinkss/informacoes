import { AppError } from "../../../Contracts/Errors/AppError";
import { ILiderRepository } from "../../../Contracts/Repositories/ILiderRepository";
import { Lider, LiderRole } from "../../../../Domain/Lideres/Models/Lider";

export class AtualizarPapelLider {
  constructor(private readonly liderRepository: ILiderRepository) {}

  async execute(input: { id: number; role: LiderRole }): Promise<Lider> {
    const atualizado = await this.liderRepository.updateRole(input.id, input.role);
    if (!atualizado) throw new AppError("Líder não encontrado", 404);
    return atualizado;
  }
}
