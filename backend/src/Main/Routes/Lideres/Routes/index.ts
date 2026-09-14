import { Router } from "express";
import { authMiddleware } from "../../../../Presentation/Middlewares/auth";
import { requireAdmin } from "../../../../Presentation/Middlewares/requireAdmin";
import {
  makeAtualizarPapelLiderController,
  makeAtualizarStatusLiderController,
  makeListLideresController,
  makeListarPendentesController,
} from "../Dependencies/composition";

export const lideresRouter = Router();

const listLideresController = makeListLideresController();
const listarPendentesController = makeListarPendentesController();
const atualizarStatusLiderController = makeAtualizarStatusLiderController();
const atualizarPapelLiderController = makeAtualizarPapelLiderController();

// Todas as rotas de gestão de líderes são exclusivas do admin.
lideresRouter.use(authMiddleware, requireAdmin);

lideresRouter.get("/", (req, res, next) => listLideresController.handle(req, res, next));
lideresRouter.get("/pendentes", (req, res, next) => listarPendentesController.handle(req, res, next));
lideresRouter.patch("/:id/status", (req, res, next) => atualizarStatusLiderController.handle(req, res, next));
lideresRouter.patch("/:id/role", (req, res, next) => atualizarPapelLiderController.handle(req, res, next));
