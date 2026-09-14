import { NextFunction, Request, Response } from "express";
import { ListLideres } from "../../../Application/Modules/Lideres/UseCases/ListLideres";

export class ListLideresController {
  constructor(private readonly useCase: ListLideres) {}

  async handle(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lideres = await this.useCase.execute();
      res.status(200).json(
        lideres.map((l) => ({ id: l.id, nome: l.nome, email: l.email, role: l.role, status: l.status }))
      );
    } catch (err) {
      next(err);
    }
  }
}
