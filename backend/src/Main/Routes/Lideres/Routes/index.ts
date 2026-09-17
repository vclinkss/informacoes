import { Router } from "express";
import { authMiddleware } from "../../../../Presentation/Middlewares/auth";
import { requireAdmin } from "../../../../Presentation/Middlewares/requireAdmin";
import { requireMaster } from "../../../../Presentation/Middlewares/requireMaster";
import {
  liderRepository,
  makeAtualizarPapelLiderController,
  makeAtualizarRestricaoLiderController,
  makeAtualizarStatusLiderController,
  makeListLideresController,
  makeListarPendentesController,
} from "../Dependencies/composition";

export const lideresRouter = Router();

const listLideresController = makeListLideresController();
const listarPendentesController = makeListarPendentesController();
const atualizarStatusLiderController = makeAtualizarStatusLiderController();
const atualizarPapelLiderController = makeAtualizarPapelLiderController();
const atualizarRestricaoLiderController = makeAtualizarRestricaoLiderController();

// Todas as rotas de gestão de líderes são exclusivas do admin.
lideresRouter.use(authMiddleware, requireAdmin);

lideresRouter.get("/", (req, res, next) => listLideresController.handle(req, res, next));
lideresRouter.get("/pendentes", (req, res, next) => listarPendentesController.handle(req, res, next));
lideresRouter.patch("/:id/status", (req, res, next) => atualizarStatusLiderController.handle(req, res, next));
lideresRouter.patch("/:id/role", (req, res, next) => atualizarPapelLiderController.handle(req, res, next));
// Só o e-mail master pode esconder/mostrar os nomes de contatos de outros líderes pra um admin.
lideresRouter.patch("/:id/restrito", requireMaster(liderRepository), (req, res, next) =>
  atualizarRestricaoLiderController.handle(req, res, next)
);
