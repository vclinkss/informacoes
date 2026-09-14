import { Router } from "express";
import { authRouter } from "./Auth/Routes";
import { lideresRouter } from "./Lideres/Routes";
import { contatosRouter } from "./Contatos/Routes";
import { geoRouter } from "./Geo/Routes";
import { agendaRouter } from "./Agenda/Routes";

export const router = Router();

router.use("/auth", authRouter);
router.use("/lideres", lideresRouter);
router.use("/contatos", contatosRouter);
router.use("/geo", geoRouter);
router.use("/agenda", agendaRouter);
