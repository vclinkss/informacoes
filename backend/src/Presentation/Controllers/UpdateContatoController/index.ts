import { NextFunction, Response } from "express";
import { z } from "zod";
import { AppError } from "../../../Application/Contracts/Errors/AppError";
import { UpdateContato } from "../../../Application/Modules/Contatos/UseCases/UpdateContato";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const pontoSchema = z.object({ lat: z.number(), lng: z.number() }).optional();

const bodySchema = z.object({
  nome: z.string().trim().optional(),
  endereco: z.string().trim().optional(),
  bairro: z.string().trim().optional(),
  whatsapp: z.string().trim().optional(),
  localVotacao: z.string().trim().optional(),
  bairroGeo: pontoSchema,
  votacaoGeo: pontoSchema,
  enderecoGeo: pontoSchema,
});

export class UpdateContatoController {
  constructor(private readonly useCase: UpdateContato) {}

  async handle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) throw new AppError("Não autenticado", 401);
      const { id } = paramsSchema.parse(req.params);
      const { bairroGeo, votacaoGeo, enderecoGeo, ...resto } = bodySchema.parse(req.body);
      const liderIdRestricao = req.userRole === "admin" ? undefined : Number(req.userId);

      const dados = {
        ...resto,
        enderecoLat: enderecoGeo ? enderecoGeo.lat : undefined,
        enderecoLng: enderecoGeo ? enderecoGeo.lng : undefined,
      };

      const contato = await this.useCase.execute({ id, dados, liderIdRestricao, bairroGeo, votacaoGeo });
      res.status(200).json(contato);
    } catch (err) {
      next(err);
    }
  }
}
