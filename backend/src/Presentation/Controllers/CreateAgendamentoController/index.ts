import { NextFunction, Response } from "express";
import { z } from "zod";
import { AppError } from "../../../Application/Contracts/Errors/AppError";
import { CreateAgendamento } from "../../../Application/Modules/Agenda/UseCases/CreateAgendamento";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

const schema = z.object({
  nome: z.string().trim().min(1, "Informe o nome"),
  whatsapp: z.string().trim().min(8, "Informe um WhatsApp válido"),
  dataHora: z.coerce.date({ message: "Informe data e hora válidas" }),
  local: z.string().trim().min(1, "Informe o local"),
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
