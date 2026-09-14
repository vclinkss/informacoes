import { DrizzleContatoRepository } from "../../../../Infrastructure/Database/Repositories/DrizzleContatoRepository";
import { DrizzleGeoCacheRepository } from "../../../../Infrastructure/Database/Repositories/DrizzleGeoCacheRepository";
import { NominatimGeocoder } from "../../../../Infrastructure/Geocoding/NominatimGeocoder";
import { ObterMapaLogistica } from "../../../../Application/Modules/Geo/UseCases/ObterMapaLogistica";
import { SalvarLocalizacaoManual } from "../../../../Application/Modules/Geo/UseCases/SalvarLocalizacaoManual";
import { ListarSugestoes } from "../../../../Application/Modules/Geo/UseCases/ListarSugestoes";
import { BuscarLocais } from "../../../../Application/Modules/Geo/UseCases/BuscarLocais";
import { MapaLogisticaController } from "../../../../Presentation/Controllers/MapaLogisticaController";
import { SalvarLocalizacaoManualController } from "../../../../Presentation/Controllers/SalvarLocalizacaoManualController";
import { ListarSugestoesController } from "../../../../Presentation/Controllers/ListarSugestoesController";
import { BuscarLocaisController } from "../../../../Presentation/Controllers/BuscarLocaisController";

const contatoRepository = new DrizzleContatoRepository();
const geoCacheRepository = new DrizzleGeoCacheRepository();

// OpenStreetMap/Nominatim: gratuito, sem chave/cartão. (GoogleGeocoder.ts fica pronto no projeto
// caso decidam ativar o faturamento do Google Maps no futuro.)
const geocoder = new NominatimGeocoder();

export function makeMapaLogisticaController() {
  const useCase = new ObterMapaLogistica(contatoRepository, geoCacheRepository, geocoder);
  return new MapaLogisticaController(useCase);
}

export function makeSalvarLocalizacaoManualController() {
  const useCase = new SalvarLocalizacaoManual(geoCacheRepository);
  return new SalvarLocalizacaoManualController(useCase);
}

export function makeListarSugestoesController() {
  const useCase = new ListarSugestoes(geoCacheRepository);
  return new ListarSugestoesController(useCase);
}

export function makeBuscarLocaisController() {
  const useCase = new BuscarLocais(geocoder);
  return new BuscarLocaisController(useCase);
}
