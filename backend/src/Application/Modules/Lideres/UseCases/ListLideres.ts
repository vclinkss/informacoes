import { ILiderRepository } from "../../../Contracts/Repositories/ILiderRepository";
import { Lider } from "../../../../Domain/Lideres/Models/Lider";

export class ListLideres {
  constructor(private readonly liderRepository: ILiderRepository) {}

  async execute(): Promise<Lider[]> {
    return this.liderRepository.findAll();
  }
}
