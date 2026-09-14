import { Router } from "express";
import { authMiddleware } from "../../../../Presentation/Middlewares/auth";
import { requireAdminOuAgenda } from "../../../../Presentation/Middlewares/requireAdminOuAgenda";
import {
  makeCreateAgendamentoController,
  makeDeleteAgendamentoController,
  makeListAgendamentosController,
  makeUpdateAgendamentoController,
} from "../Dependencies/composition";

export const agendaRouter = Router();

// Agenda é exclusiva de admin e do papel "agenda" — líder comum não acessa nem pra cadastrar.
agendaRouter.use(authMiddleware, requireAdminOuAgenda);

const createAgendamentoController = makeCreateAgendamentoController();
const listAgendamentosController = makeListAgendamentosController();
const updateAgendamentoController = makeUpdateAgendamentoController();
const deleteAgendamentoController = makeDeleteAgendamentoController();

agendaRouter.post("/", (req, res, next) => createAgendamentoController.handle(req, res, next));
agendaRouter.get("/", (req, res, next) => listAgendamentosController.handle(req, res, next));
agendaRouter.put("/:id", (req, res, next) => updateAgendamentoController.handle(req, res, next));
agendaRouter.delete("/:id", (req, res, next) => deleteAgendamentoController.handle(req, res, next));
