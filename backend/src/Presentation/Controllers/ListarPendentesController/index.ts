import { NextFunction, Request, Response } from "express";
import { ListarPendentes } from "../../../Application/Modules/Lideres/UseCases/ListarPendentes";

export class ListarPendentesController {
  constructor(private readonly useCase: ListarPendentes) {}

  async handle(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pendentes = await this.useCase.execute();
      res.status(200).json(
        pendentes.map((l) => ({ id: l.id, nome: l.nome, email: l.email, status: l.status }))
      );
    } catch (err) {
      next(err);
    }
  }
}
