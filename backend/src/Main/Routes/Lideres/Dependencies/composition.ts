import { DrizzleLiderRepository } from "../../../../Infrastructure/Database/Repositories/DrizzleLiderRepository";
import { ListLideres } from "../../../../Application/Modules/Lideres/UseCases/ListLideres";
import { ListarPendentes } from "../../../../Application/Modules/Lideres/UseCases/ListarPendentes";
import { AtualizarStatusLider } from "../../../../Application/Modules/Lideres/UseCases/AtualizarStatusLider";
import { AtualizarPapelLider } from "../../../../Application/Modules/Lideres/UseCases/AtualizarPapelLider";
import { ListLideresController } from "../../../../Presentation/Controllers/ListLideresController";
import { ListarPendentesController } from "../../../../Presentation/Controllers/ListarPendentesController";
import { AtualizarStatusLiderController } from "../../../../Presentation/Controllers/AtualizarStatusLiderController";
import { AtualizarPapelLiderController } from "../../../../Presentation/Controllers/AtualizarPapelLiderController";

const liderRepository = new DrizzleLiderRepository();

export function makeListLideresController() {
  const useCase = new ListLideres(liderRepository);
  return new ListLideresController(useCase);
}

export function makeListarPendentesController() {
  const useCase = new ListarPendentes(liderRepository);
  return new ListarPendentesController(useCase);
}

export function makeAtualizarStatusLiderController() {
  const useCase = new AtualizarStatusLider(liderRepository);
  return new AtualizarStatusLiderController(useCase);
}

export function makeAtualizarPapelLiderController() {
  const useCase = new AtualizarPapelLider(liderRepository);
  return new AtualizarPapelLiderController(useCase);
}
