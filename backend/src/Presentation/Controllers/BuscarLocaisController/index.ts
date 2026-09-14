import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { BuscarLocais } from "../../../Application/Modules/Geo/UseCases/BuscarLocais";

const querySchema = z.object({
  q: z.string().trim().min(1),
});

export class BuscarLocaisController {
  constructor(private readonly useCase: BuscarLocais) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { q } = querySchema.parse(req.query);
      const sugestoes = await this.useCase.execute(q);
      res.status(200).json(sugestoes);
    } catch (err) {
      next(err);
    }
  }
}
