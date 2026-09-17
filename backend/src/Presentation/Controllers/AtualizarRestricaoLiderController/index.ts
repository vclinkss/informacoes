import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { AtualizarRestricaoLider } from "../../../Application/Modules/Lideres/UseCases/AtualizarRestricaoLider";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const bodySchema = z.object({
  restrito: z.boolean(),
});

export class AtualizarRestricaoLiderController {
  constructor(private readonly useCase: AtualizarRestricaoLider) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = paramsSchema.parse(req.params);
      const { restrito } = bodySchema.parse(req.body);
      const lider = await this.useCase.execute({ id, restrito });
      res.status(200).json({
        id: lider.id,
        nome: lider.nome,
        email: lider.email,
        role: lider.role,
        status: lider.status,
        restrito: lider.restrito,
      });
    } catch (err) {
      next(err);
    }
  }
}
