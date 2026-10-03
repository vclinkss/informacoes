import { NextFunction, Response } from "express";
import { AppError } from "../../../Application/Contracts/Errors/AppError";
import { ContarPorSecao } from "../../../Application/Modules/Geo/UseCases/ContarPorSecao";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";
import { podeVerTudoContatos } from "../../Helpers/papeis";

export class ContagemSecoesController {
  constructor(private readonly useCase: ContarPorSecao) {}

  async handle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) throw new AppError("Não autenticado", 401);
      // Mesma regra do mapa: admin, motorista e "mapa" veem o total geral; líder só os próprios.
      const verTudo = podeVerTudoContatos(req.userRole) || req.userRole === "mapa";
      const contagem = await this.useCase.execute({ liderId: verTudo ? undefined : Number(req.userId) });
      res.status(200).json(contagem);
    } catch (err) {
      next(err);
    }
  }
}
