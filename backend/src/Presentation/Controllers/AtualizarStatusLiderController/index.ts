import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { AtualizarStatusLider } from "../../../Application/Modules/Lideres/UseCases/AtualizarStatusLider";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const bodySchema = z.object({
  status: z.enum(["aprovado", "rejeitado", "pendente"]),
});

export class AtualizarStatusLiderController {
  constructor(private readonly useCase: AtualizarStatusLider) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = paramsSchema.parse(req.params);
      const { status } = bodySchema.parse(req.body);
      const lider = await this.useCase.execute({ id, status });
      res.status(200).json({ id: lider.id, nome: lider.nome, email: lider.email, status: lider.status });
    } catch (err) {
      next(err);
    }
  }
}
