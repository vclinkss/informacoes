import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { ListarSugestoes } from "../../../Application/Modules/Geo/UseCases/ListarSugestoes";

const querySchema = z.object({
  tipo: z.enum(["bairro", "votacao"]),
});

export class ListarSugestoesController {
  constructor(private readonly useCase: ListarSugestoes) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tipo } = querySchema.parse(req.query);
      const sugestoes = await this.useCase.execute(tipo);
      res.status(200).json(sugestoes);
    } catch (err) {
      next(err);
    }
  }
}
