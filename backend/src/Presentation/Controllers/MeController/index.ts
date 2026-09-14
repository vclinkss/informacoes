import { NextFunction, Response } from "express";
import { AppError } from "../../../Application/Contracts/Errors/AppError";
import { ObterUsuarioLogado } from "../../../Application/Modules/Auth/UseCases/ObterUsuarioLogado";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

export class MeController {
  constructor(private readonly useCase: ObterUsuarioLogado) {}

  async handle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) throw new AppError("Não autenticado", 401);
      const usuario = await this.useCase.execute(Number(req.userId));
      res.status(200).json(usuario);
    } catch (err) {
      next(err);
    }
  }
}
