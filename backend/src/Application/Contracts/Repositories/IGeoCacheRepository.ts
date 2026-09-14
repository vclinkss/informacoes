import { PontoGeografico } from "../Geocoding/IGeocoder";

export type TipoLocalGeo = "bairro" | "votacao";
export type PontoNomeadoCache = PontoGeografico & { nome: string };

export interface IGeoCacheRepository {
  obter(nome: string): Promise<PontoGeografico | null>;
  salvar(nome: string, ponto: PontoGeografico, tipo?: TipoLocalGeo): Promise<void>;
  listarPorTipo(tipo: TipoLocalGeo): Promise<PontoNomeadoCache[]>;
}
