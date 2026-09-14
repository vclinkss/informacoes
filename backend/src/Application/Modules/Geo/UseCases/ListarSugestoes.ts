import { IGeoCacheRepository, PontoNomeadoCache, TipoLocalGeo } from "../../../Contracts/Repositories/IGeoCacheRepository";

export class ListarSugestoes {
  constructor(private readonly geoCacheRepository: IGeoCacheRepository) {}

  async execute(tipo: TipoLocalGeo): Promise<PontoNomeadoCache[]> {
    return this.geoCacheRepository.listarPorTipo(tipo);
  }
}
