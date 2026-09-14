import { IContatoRepository } from "../../../Contracts/Repositories/IContatoRepository";
import { Contato } from "../../../../Domain/Contatos/Models/Contato";

export class ListContatos {
  constructor(private readonly contatoRepository: IContatoRepository) {}

  async execute(input: { liderId?: number; busca?: string } = {}): Promise<Contato[]> {
    return this.contatoRepository.findAll({ liderId: input.liderId, busca: input.busca });
  }
}
