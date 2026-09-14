import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { AtualizarPapelLider } from "../../../Application/Modules/Lideres/UseCases/AtualizarPapelLider";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const bodySchema = z.object({
  role: z.enum(["lider", "admin", "agenda", "motorista"]),
});

export class AtualizarPapelLiderController {
  constructor(private readonly useCase: AtualizarPapelLider) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = paramsSchema.parse(req.params);
      const { role } = bodySchema.parse(req.body);
      const lider = await this.useCase.execute({ id, role });
      res.status(200).json({ id: lider.id, nome: lider.nome, email: lider.email, role: lider.role, status: lider.status });
    } catch (err) {
      next(err);
    }
  }
}
