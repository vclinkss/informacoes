import { NextFunction, Response } from "express";
import { AppError } from "../../../Application/Contracts/Errors/AppError";
import { ObterMapaLogistica } from "../../../Application/Modules/Geo/UseCases/ObterMapaLogistica";
import { ILiderRepository } from "../../../Application/Contracts/Repositories/ILiderRepository";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";
import { podeVerTudoContatos } from "../../Helpers/papeis";
import { mascararContatosRestritos } from "../../Helpers/mascararContatos";

export class MapaLogisticaController {
  constructor(
    private readonly useCase: ObterMapaLogistica,
    private readonly liderRepository: ILiderRepository
  ) {}

  async handle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) throw new AppError("Não autenticado", 401);
      const liderId = podeVerTudoContatos(req.userRole) ? undefined : Number(req.userId);
      const mapa = await this.useCase.execute({ liderId });

      if (req.userRole === "admin") {
        const usuario = await this.liderRepository.findById(Number(req.userId));
        if (usuario?.restrito) {
          mapa.contatos = mascararContatosRestritos(mapa.contatos, Number(req.userId));
        }
      }

      res.status(200).json(mapa);
    } catch (err) {
      next(err);
    }
  }
}
