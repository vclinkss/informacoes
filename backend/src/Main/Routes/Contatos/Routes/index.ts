import { Router } from "express";
import { authMiddleware } from "../../../../Presentation/Middlewares/auth";
import { requireNaoMotorista } from "../../../../Presentation/Middlewares/requireNaoMotorista";
import {
  makeCreateContatoController,
  makeDeleteContatoController,
  makeEstatisticasController,
  makeExportarContatosExcelController,
  makeListContatosController,
  makeUpdateContatoController,
  makeUpdateStatusLigacaoController,
} from "../Dependencies/composition";

export const contatosRouter = Router();

contatosRouter.use(authMiddleware);

const createContatoController = makeCreateContatoController();
const listContatosController = makeListContatosController();
const updateStatusLigacaoController = makeUpdateStatusLigacaoController();
const updateContatoController = makeUpdateContatoController();
const deleteContatoController = makeDeleteContatoController();
const estatisticasController = makeEstatisticasController();
const exportarContatosExcelController = makeExportarContatosExcelController();

// Leitura: aberta pra todo mundo autenticado (o controller escopa por papel).
contatosRouter.get("/", (req, res, next) => listContatosController.handle(req, res, next));
contatosRouter.get("/estatisticas", (req, res, next) =>
  estatisticasController.handle(req, res, next)
);
contatosRouter.get("/exportar", (req, res, next) =>
  exportarContatosExcelController.handle(req, res, next)
);

// Escrita: motorista não cadastra/edita/apaga nada.
contatosRouter.post("/", requireNaoMotorista, (req, res, next) => createContatoController.handle(req, res, next));
contatosRouter.patch("/:id/ligacao", requireNaoMotorista, (req, res, next) =>
  updateStatusLigacaoController.handle(req, res, next)
);
contatosRouter.put("/:id", requireNaoMotorista, (req, res, next) => updateContatoController.handle(req, res, next));
contatosRouter.delete("/:id", requireNaoMotorista, (req, res, next) => deleteContatoController.handle(req, res, next));
