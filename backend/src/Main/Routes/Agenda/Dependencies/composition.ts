import { DrizzleAgendamentoRepository } from "../../../../Infrastructure/Database/Repositories/DrizzleAgendamentoRepository";
import { CreateAgendamento } from "../../../../Application/Modules/Agenda/UseCases/CreateAgendamento";
import { ListAgendamentos } from "../../../../Application/Modules/Agenda/UseCases/ListAgendamentos";
import { UpdateAgendamento } from "../../../../Application/Modules/Agenda/UseCases/UpdateAgendamento";
import { DeleteAgendamento } from "../../../../Application/Modules/Agenda/UseCases/DeleteAgendamento";
import { CreateAgendamentoController } from "../../../../Presentation/Controllers/CreateAgendamentoController";
import { ListAgendamentosController } from "../../../../Presentation/Controllers/ListAgendamentosController";
import { UpdateAgendamentoController } from "../../../../Presentation/Controllers/UpdateAgendamentoController";
import { DeleteAgendamentoController } from "../../../../Presentation/Controllers/DeleteAgendamentoController";

const agendamentoRepository = new DrizzleAgendamentoRepository();

export function makeCreateAgendamentoController() {
  const useCase = new CreateAgendamento(agendamentoRepository);
  return new CreateAgendamentoController(useCase);
}

export function makeListAgendamentosController() {
  const useCase = new ListAgendamentos(agendamentoRepository);
  return new ListAgendamentosController(useCase);
}

export function makeUpdateAgendamentoController() {
  const useCase = new UpdateAgendamento(agendamentoRepository);
  return new UpdateAgendamentoController(useCase);
}

export function makeDeleteAgendamentoController() {
  const useCase = new DeleteAgendamento(agendamentoRepository);
  return new DeleteAgendamentoController(useCase);
}
