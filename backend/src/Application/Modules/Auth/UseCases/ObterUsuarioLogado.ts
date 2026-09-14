import { AppError } from "../../../Contracts/Errors/AppError";
import { ILiderRepository } from "../../../Contracts/Repositories/ILiderRepository";

export class ObterUsuarioLogado {
  constructor(private readonly liderRepository: ILiderRepository) {}

  async execute(id: number) {
    const lider = await this.liderRepository.findById(id);
    if (!lider) throw new AppError("Usuário não encontrado", 404);
    return {
      id: lider.id,
      nome: lider.nome,
      email: lider.email,
      role: lider.role,
      status: lider.status,
    };
  }
}
