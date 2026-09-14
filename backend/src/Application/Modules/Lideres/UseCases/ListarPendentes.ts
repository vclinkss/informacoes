import { ILiderRepository } from "../../../Contracts/Repositories/ILiderRepository";
import { Lider } from "../../../../Domain/Lideres/Models/Lider";

export class ListarPendentes {
  constructor(private readonly liderRepository: ILiderRepository) {}

  async execute(): Promise<Lider[]> {
    return this.liderRepository.findByStatus("pendente");
  }
}
