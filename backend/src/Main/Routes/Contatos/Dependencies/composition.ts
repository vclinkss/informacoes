import { DrizzleContatoRepository } from "../../../../Infrastructure/Database/Repositories/DrizzleContatoRepository";
import { DrizzleGeoCacheRepository } from "../../../../Infrastructure/Database/Repositories/DrizzleGeoCacheRepository";
import { CreateContato } from "../../../../Application/Modules/Contatos/UseCases/CreateContato";
import { ListContatos } from "../../../../Application/Modules/Contatos/UseCases/ListContatos";
import { UpdateStatusLigacao } from "../../../../Application/Modules/Contatos/UseCases/UpdateStatusLigacao";
import { UpdateContato } from "../../../../Application/Modules/Contatos/UseCases/UpdateContato";
import { DeleteContato } from "../../../../Application/Modules/Contatos/UseCases/DeleteContato";
import { GetEstatisticas } from "../../../../Application/Modules/Contatos/UseCases/GetEstatisticas";
import { CreateContatoController } from "../../../../Presentation/Controllers/CreateContatoController";
import { ListContatosController } from "../../../../Presentation/Controllers/ListContatosController";
import { UpdateStatusLigacaoController } from "../../../../Presentation/Controllers/UpdateStatusLigacaoController";
import { UpdateContatoController } from "../../../../Presentation/Controllers/UpdateContatoController";
import { DeleteContatoController } from "../../../../Presentation/Controllers/DeleteContatoController";
import { EstatisticasController } from "../../../../Presentation/Controllers/EstatisticasController";
import { ExportarContatosExcelController } from "../../../../Presentation/Controllers/ExportarContatosExcelController";

const contatoRepository = new DrizzleContatoRepository();
const geoCacheRepository = new DrizzleGeoCacheRepository();

export function makeCreateContatoController() {
  const useCase = new CreateContato(contatoRepository, geoCacheRepository);
  return new CreateContatoController(useCase);
}

export function makeUpdateContatoController() {
  const useCase = new UpdateContato(contatoRepository, geoCacheRepository);
  return new UpdateContatoController(useCase);
}

export function makeDeleteContatoController() {
  const useCase = new DeleteContato(contatoRepository);
  return new DeleteContatoController(useCase);
}

export function makeListContatosController() {
  const useCase = new ListContatos(contatoRepository);
  return new ListContatosController(useCase);
}

export function makeUpdateStatusLigacaoController() {
  const useCase = new UpdateStatusLigacao(contatoRepository);
  return new UpdateStatusLigacaoController(useCase);
}

export function makeEstatisticasController() {
  const useCase = new GetEstatisticas(contatoRepository);
  return new EstatisticasController(useCase);
}

export function makeExportarContatosExcelController() {
  const useCase = new ListContatos(contatoRepository);
  return new ExportarContatosExcelController(useCase);
}
