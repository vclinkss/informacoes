import { AppError } from "../../../Contracts/Errors/AppError";
import { IGeoCacheRepository, TipoLocalGeo } from "../../../Contracts/Repositories/IGeoCacheRepository";

export class SalvarLocalizacaoManual {
  constructor(private readonly geoCacheRepository: IGeoCacheRepository) {}

  async execute(input: { nome: string; lat: number; lng: number; tipo?: TipoLocalGeo }): Promise<void> {
    const nome = input.nome.trim();
    if (!nome) throw new AppError("Informe o nome do bairro/local de votação", 400);
    if (Math.abs(input.lat) > 90 || Math.abs(input.lng) > 180) {
      throw new AppError("Coordenadas inválidas", 400);
    }
    await this.geoCacheRepository.salvar(nome, { lat: input.lat, lng: input.lng }, input.tipo);
  }
}
