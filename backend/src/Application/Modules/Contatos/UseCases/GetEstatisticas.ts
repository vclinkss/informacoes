import { IContatoRepository } from "../../../Contracts/Repositories/IContatoRepository";

export class GetEstatisticas {
  constructor(private readonly contatoRepository: IContatoRepository) {}

  async execute(input: { liderId?: number } = {}) {
    const [porBairro, porLocalVotacao] = await Promise.all([
      this.contatoRepository.contarPorBairro(input.liderId),
      this.contatoRepository.contarPorLocalVotacao(input.liderId),
    ]);
    return { porBairro, porLocalVotacao };
  }
}
