import { NextFunction, Response } from "express";
import { AppError } from "../../../Application/Contracts/Errors/AppError";
import { GetEstatisticas } from "../../../Application/Modules/Contatos/UseCases/GetEstatisticas";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";
import { podeVerTudoContatos } from "../../Helpers/papeis";

export class EstatisticasController {
  constructor(private readonly useCase: GetEstatisticas) {}

  async handle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) throw new AppError("Não autenticado", 401);
      const liderId = podeVerTudoContatos(req.userRole) ? undefined : Number(req.userId);
      const estatisticas = await this.useCase.execute({ liderId });
      res.status(200).json(estatisticas);
    } catch (err) {
      next(err);
    }
  }
}
