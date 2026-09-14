import { NextFunction, Response } from "express";
import { z } from "zod";
import { AppError } from "../../../Application/Contracts/Errors/AppError";
import { CreateContato } from "../../../Application/Modules/Contatos/UseCases/CreateContato";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

const pontoSchema = z.object({ lat: z.number(), lng: z.number() }).optional();

const schema = z.object({
  nome: z.string().trim().min(1, "Informe o nome"),
  endereco: z.string().trim().min(1, "Informe o endereço"),
  bairro: z.string().trim().min(1, "Informe o bairro"),
  whatsapp: z.string().trim().min(8, "Informe um WhatsApp válido"),
  localVotacao: z.string().trim().min(1, "Informe o local de votação"),
  bairroGeo: pontoSchema,
  votacaoGeo: pontoSchema,
  enderecoGeo: pontoSchema,
});

export class CreateContatoController {
  constructor(private readonly useCase: CreateContato) {}

  async handle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) throw new AppError("Não autenticado", 401);
      const body = schema.parse(req.body);
      const contato = await this.useCase.execute({
        ...body,
        liderId: Number(req.userId),
        liderNome: req.userNome || "",
      });
      res.status(201).json(contato);
    } catch (err) {
      next(err);
    }
  }
}
