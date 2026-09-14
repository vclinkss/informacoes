import { IContatoRepository } from "../../../Contracts/Repositories/IContatoRepository";
import { IGeoCacheRepository, TipoLocalGeo } from "../../../Contracts/Repositories/IGeoCacheRepository";
import { IGeocoder } from "../../../Contracts/Geocoding/IGeocoder";

export type RotaTransporte = { bairro: string; localVotacao: string; total: number };
export type PontoNomeado = { nome: string; lat: number; lng: number };
export type PontoContato = {
  id: number;
  nome: string;
  lat: number;
  lng: number;
  bairro: string;
  localVotacao: string;
  liguei: boolean;
};

export type NaoLocalizado = { nome: string; tipo: TipoLocalGeo };

export type MapaLogistica = {
  bairros: PontoNomeado[];
  locaisVotacao: PontoNomeado[];
  rotas: RotaTransporte[];
  naoLocalizados: NaoLocalizado[];
  contatos: PontoContato[];
};

const REGIAO_PADRAO = "Macapá, Amapá, Brasil";

export class ObterMapaLogistica {
  constructor(
    private readonly contatoRepository: IContatoRepository,
    private readonly geoCacheRepository: IGeoCacheRepository,
    private readonly geocoder: IGeocoder
  ) {}

  async execute(input: { liderId?: number } = {}): Promise<MapaLogistica> {
    const contatos = await this.contatoRepository.findAll({ liderId: input.liderId });

    const rotasPorChave = new Map<string, RotaTransporte>();
    const nomesBairros = new Set<string>();
    const nomesLocais = new Set<string>();

    for (const c of contatos) {
      nomesBairros.add(c.bairro);
      nomesLocais.add(c.localVotacao);
      const chave = c.bairro + "␟" + c.localVotacao;
      const atual = rotasPorChave.get(chave) || { bairro: c.bairro, localVotacao: c.localVotacao, total: 0 };
      atual.total += 1;
      rotasPorChave.set(chave, atual);
    }

    const naoLocalizados: NaoLocalizado[] = [];

    const resolver = async (nome: string, tipo: TipoLocalGeo): Promise<PontoNomeado | null> => {
      const emCache = await this.geoCacheRepository.obter(nome);
      if (emCache) return { nome, ...emCache };

      let ponto = await this.geocoder.geocodificar(`${nome}, ${REGIAO_PADRAO}`);

      // Nomes de escolas às vezes não estão mapeados com o prefixo "Escola Estadual/Municipal ...".
      // Tenta de novo só com a parte final do nome (geralmente a mais distintiva).
      if (!ponto) {
        const semPrefixo = nome.replace(/^(escola\s+(estadual|municipal)|e\.?e\.?|e\.?m\.?|col[ée]gio)\s+/i, "").trim();
        if (semPrefixo && semPrefixo !== nome) {
          ponto = await this.geocoder.geocodificar(`${semPrefixo}, ${REGIAO_PADRAO}`);
        }
      }

      if (!ponto) {
        naoLocalizados.push({ nome, tipo });
        return null;
      }
      await this.geoCacheRepository.salvar(nome, ponto, tipo);
      return { nome, ...ponto };
    };

    const bairros: PontoNomeado[] = [];
    for (const nome of nomesBairros) {
      const ponto = await resolver(nome, "bairro");
      if (ponto) bairros.push(ponto);
    }

    const locaisVotacao: PontoNomeado[] = [];
    for (const nome of nomesLocais) {
      const ponto = await resolver(nome, "votacao");
      if (ponto) locaisVotacao.push(ponto);
    }

    const pontosContatos: PontoContato[] = contatos
      .filter((c) => c.enderecoLat !== null && c.enderecoLng !== null && c.id !== undefined)
      .map((c) => ({
        id: c.id as number,
        nome: c.nome,
        lat: c.enderecoLat as number,
        lng: c.enderecoLng as number,
        bairro: c.bairro,
        localVotacao: c.localVotacao,
        liguei: c.liguei,
      }));

    return {
      bairros,
      locaisVotacao,
      rotas: Array.from(rotasPorChave.values()),
      naoLocalizados,
      contatos: pontosContatos,
    };
  }
}
