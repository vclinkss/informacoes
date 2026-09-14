import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { SalvarLocalizacaoManual } from "../../../Application/Modules/Geo/UseCases/SalvarLocalizacaoManual";

const schema = z.object({
  nome: z.string().trim().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  tipo: z.enum(["bairro", "votacao"]).optional(),
});

export class SalvarLocalizacaoManualController {
  constructor(private readonly useCase: SalvarLocalizacaoManual) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = schema.parse(req.body);
      await this.useCase.execute(body);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
