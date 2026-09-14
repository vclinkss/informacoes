import { NextFunction, Response } from "express";
import { AppError } from "../../../Application/Contracts/Errors/AppError";
import { ObterMapaLogistica } from "../../../Application/Modules/Geo/UseCases/ObterMapaLogistica";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";
import { podeVerTudoContatos } from "../../Helpers/papeis";

export class MapaLogisticaController {
  constructor(private readonly useCase: ObterMapaLogistica) {}

  async handle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) throw new AppError("Não autenticado", 401);
      const liderId = podeVerTudoContatos(req.userRole) ? undefined : Number(req.userId);
      const mapa = await this.useCase.execute({ liderId });
      res.status(200).json(mapa);
    } catch (err) {
      next(err);
    }
  }
}
