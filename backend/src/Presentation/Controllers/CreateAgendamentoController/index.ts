import { NextFunction, Response } from "express";
import { z } from "zod";
import { AppError } from "../../../Application/Contracts/Errors/AppError";
import { CreateAgendamento } from "../../../Application/Modules/Agenda/UseCases/CreateAgendamento";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

const schema = z.object({
  nome: z.string().trim().optional(),
  whatsapp: z.string().trim().optional(),
  dataHora: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.date({ message: "Data e hora inválidas" }).optional()
  ),
  local: z.string().trim().optional(),
  observacao: z.string().trim().max(500).optional(),
});

export class CreateAgendamentoController {
  constructor(private readonly useCase: CreateAgendamento) {}

  async handle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) throw new AppError("Não autenticado", 401);
      const body = schema.parse(req.body);
      const agendamento = await this.useCase.execute({
        ...body,
        liderId: Number(req.userId),
        liderNome: req.userNome || "",
      });
      res.status(201).json(agendamento);
    } catch (err) {
      next(err);
    }
  }
}
