import { Router } from "express";
import { authMiddleware } from "../../../../Presentation/Middlewares/auth";
import { requireNaoMotorista } from "../../../../Presentation/Middlewares/requireNaoMotorista";
import {
  makeBuscarLocaisController,
  makeListarSugestoesController,
  makeMapaLogisticaController,
  makeSalvarLocalizacaoManualController,
} from "../Dependencies/composition";

export const geoRouter = Router();

geoRouter.use(authMiddleware);

const mapaLogisticaController = makeMapaLogisticaController();
const salvarLocalizacaoManualController = makeSalvarLocalizacaoManualController();
const listarSugestoesController = makeListarSugestoesController();
const buscarLocaisController = makeBuscarLocaisController();

geoRouter.get("/mapa", (req, res, next) => mapaLogisticaController.handle(req, res, next));
geoRouter.put("/local", requireNaoMotorista, (req, res, next) => salvarLocalizacaoManualController.handle(req, res, next));
geoRouter.get("/sugestoes", (req, res, next) => listarSugestoesController.handle(req, res, next));
geoRouter.get("/buscar", (req, res, next) => buscarLocaisController.handle(req, res, next));
