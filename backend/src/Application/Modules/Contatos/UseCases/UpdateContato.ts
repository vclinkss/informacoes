import { AppError } from "../../../Contracts/Errors/AppError";
import { ContatoEdicao, IContatoRepository } from "../../../Contracts/Repositories/IContatoRepository";
import { IGeoCacheRepository } from "../../../Contracts/Repositories/IGeoCacheRepository";
import { Contato } from "../../../../Domain/Contatos/Models/Contato";
import { PontoOpcional } from "./CreateContato";

export class UpdateContato {
  constructor(
    private readonly contatoRepository: IContatoRepository,
    private readonly geoCacheRepository: IGeoCacheRepository
  ) {}

  async execute(input: {
    id: number;
    dados: ContatoEdicao;
    liderIdRestricao?: number;
    bairroGeo?: PontoOpcional;
    votacaoGeo?: PontoOpcional;
  }): Promise<Contato> {
    const atualizado = await this.contatoRepository.update(input.id, input.dados, input.liderIdRestricao);
    if (!atualizado) throw new AppError("Contato não encontrado", 404);

    if (input.bairroGeo) {
      await this.geoCacheRepository.salvar(input.dados.bairro, input.bairroGeo, "bairro");
    }
    if (input.votacaoGeo) {
      await this.geoCacheRepository.salvar(input.dados.localVotacao, input.votacaoGeo, "votacao");
    }

    return atualizado;
  }
}
