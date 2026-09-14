import { NextFunction, Response } from "express";
import { z } from "zod";
import { AppError } from "../../../Application/Contracts/Errors/AppError";
import { UpdateStatusLigacao } from "../../../Application/Modules/Contatos/UseCases/UpdateStatusLigacao";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const bodySchema = z.object({
  liguei: z.boolean(),
  observacao: z.string().trim().max(500).nullable().optional(),
});

export class UpdateStatusLigacaoController {
  constructor(private readonly useCase: UpdateStatusLigacao) {}

  async handle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) throw new AppError("Não autenticado", 401);
      const { id } = paramsSchema.parse(req.params);
      const { liguei, observacao } = bodySchema.parse(req.body);

      const liderIdRestricao = req.userRole === "admin" ? undefined : Number(req.userId);

      const contato = await this.useCase.execute({
        id,
        liguei,
        observacao: observacao ?? null,
        liderIdRestricao,
      });
      res.status(200).json(contato);
    } catch (err) {
      next(err);
    }
  }
}
