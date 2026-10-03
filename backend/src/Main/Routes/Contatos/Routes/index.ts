import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../../../../Presentation/Middlewares/auth";
import { requireNaoMapa } from "../../../../Presentation/Middlewares/requireNaoMapa";
import { requireNaoMotorista } from "../../../../Presentation/Middlewares/requireNaoMotorista";
import {
  makeCreateContatoController,
  makeDeleteContatoController,
  makeEstatisticasController,
  makeExportarContatosExcelController,
  makeExportarContatosWordController,
  makeImportarContatosExcelController,
  makeListContatosController,
  makeModeloImportacaoExcelController,
  makeUpdateContatoController,
  makeUpdateStatusLigacaoController,
} from "../Dependencies/composition";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

export const contatosRouter = Router();

// Papel "mapa" não enxerga a lista de contatos (só o mapa, em /geo/mapa).
contatosRouter.use(authMiddleware, requireNaoMapa);

const createContatoController = makeCreateContatoController();
const listContatosController = makeListContatosController();
const updateStatusLigacaoController = makeUpdateStatusLigacaoController();
const updateContatoController = makeUpdateContatoController();
const deleteContatoController = makeDeleteContatoController();
const estatisticasController = makeEstatisticasController();
const exportarContatosExcelController = makeExportarContatosExcelController();
const exportarContatosWordController = makeExportarContatosWordController();
const importarContatosExcelController = makeImportarContatosExcelController();
const modeloImportacaoExcelController = makeModeloImportacaoExcelController();

// Leitura: aberta pra todo mundo autenticado (o controller escopa por papel).
contatosRouter.get("/", (req, res, next) => listContatosController.handle(req, res, next));
contatosRouter.get("/estatisticas", (req, res, next) =>
  estatisticasController.handle(req, res, next)
);
contatosRouter.get("/exportar", (req, res, next) =>
  exportarContatosExcelController.handle(req, res, next)
);
contatosRouter.get("/exportar-word", (req, res, next) =>
  exportarContatosWordController.handle(req, res, next)
);
contatosRouter.get("/modelo-importacao", (req, res, next) =>
  modeloImportacaoExcelController.handle(req, res, next)
);

// Escrita: motorista não cadastra/edita/apaga nada.
contatosRouter.post("/", requireNaoMotorista, (req, res, next) => createContatoController.handle(req, res, next));
contatosRouter.post("/importar", requireNaoMotorista, upload.single("arquivo"), (req, res, next) =>
  importarContatosExcelController.handle(req, res, next)
);
contatosRouter.patch("/:id/ligacao", requireNaoMotorista, (req, res, next) =>
  updateStatusLigacaoController.handle(req, res, next)
);
contatosRouter.put("/:id", requireNaoMotorista, (req, res, next) => updateContatoController.handle(req, res, next));
contatosRouter.delete("/:id", requireNaoMotorista, (req, res, next) => deleteContatoController.handle(req, res, next));
