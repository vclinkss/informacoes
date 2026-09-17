import { NextFunction, Response } from "express";
import { z } from "zod";
import { AppError } from "../../../Application/Contracts/Errors/AppError";
import { ListContatos } from "../../../Application/Modules/Contatos/UseCases/ListContatos";
import { ILiderRepository } from "../../../Application/Contracts/Repositories/ILiderRepository";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";
import { podeVerTudoContatos } from "../../Helpers/papeis";
import { mascararContatosRestritos } from "../../Helpers/mascararContatos";

const querySchema = z.object({
  busca: z.string().trim().optional(),
  liderId: z.coerce.number().int().positive().optional(),
});

export class ListContatosController {
  constructor(
    private readonly useCase: ListContatos,
    private readonly liderRepository: ILiderRepository
  ) {}

  async handle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) throw new AppError("Não autenticado", 401);
      const query = querySchema.parse(req.query);

      const filtro = podeVerTudoContatos(req.userRole)
        ? { busca: query.busca, liderId: query.liderId }
        : { liderId: Number(req.userId) };

      const contatos = await this.useCase.execute(filtro);

      if (req.userRole === "admin") {
        const usuario = await this.liderRepository.findById(Number(req.userId));
        if (usuario?.restrito) {
          res.status(200).json(mascararContatosRestritos(contatos, Number(req.userId)));
          return;
        }
      }

      res.status(200).json(contatos);
    } catch (err) {
      next(err);
    }
  }
}
