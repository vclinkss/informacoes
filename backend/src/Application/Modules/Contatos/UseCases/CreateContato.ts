import { IContatoRepository } from "../../../Contracts/Repositories/IContatoRepository";
import { IGeoCacheRepository } from "../../../Contracts/Repositories/IGeoCacheRepository";
import { Contato } from "../../../../Domain/Contatos/Models/Contato";

export type PontoOpcional = { lat: number; lng: number } | undefined;

export type CreateContatoInput = {
  liderId: number;
  liderNome: string;
  nome?: string;
  endereco?: string;
  bairro?: string;
  whatsapp?: string;
  localVotacao?: string;
  precisaCarona?: boolean;
  /** Se a pessoa escolheu o bairro/local numa sugestão de busca, já vem com a localização exata. */
  bairroGeo?: PontoOpcional;
  votacaoGeo?: PontoOpcional;
  /** Localização exata da casa da pessoa (opcional — nem todo endereço é encontrado automaticamente). */
  enderecoGeo?: PontoOpcional;
};

export class CreateContato {
  constructor(
    private readonly contatoRepository: IContatoRepository,
    private readonly geoCacheRepository: IGeoCacheRepository
  ) {}

  async execute(input: CreateContatoInput): Promise<Contato> {
    const contato = new Contato({
      liderId: input.liderId,
      liderNome: input.liderNome,
      nome: input.nome?.trim() || "",
      endereco: input.endereco?.trim() || "",
      enderecoLat: input.enderecoGeo?.lat,
      enderecoLng: input.enderecoGeo?.lng,
      bairro: input.bairro?.trim() || "",
      whatsapp: input.whatsapp?.trim() || "",
      localVotacao: input.localVotacao?.trim() || "",
      precisaCarona: input.precisaCarona ?? true,
    });

    const criado = await this.contatoRepository.create(contato);

    if (input.bairroGeo) {
      await this.geoCacheRepository.salvar(contato.bairro, input.bairroGeo, "bairro");
    }
    if (input.votacaoGeo) {
      await this.geoCacheRepository.salvar(contato.localVotacao, input.votacaoGeo, "votacao");
    }

    return criado;
  }
}
