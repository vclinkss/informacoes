import { NextFunction, Response } from "express";
import { z } from "zod";
import { AppError } from "../../../Application/Contracts/Errors/AppError";
import { UpdateAgendamento } from "../../../Application/Modules/Agenda/UseCases/UpdateAgendamento";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

function veTudo(role?: string): boolean {
  return role === "admin" || role === "agenda";
}

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const bodySchema = z.object({
  nome: z.string().trim().optional(),
  whatsapp: z.string().trim().optional(),
  dataHora: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.date({ message: "Data e hora inválidas" }).optional()
  ),
  local: z.string().trim().optional(),
  observacao: z.string().trim().max(500).optional(),
});

export class UpdateAgendamentoController {
  constructor(private readonly useCase: UpdateAgendamento) {}

  async handle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) throw new AppError("Não autenticado", 401);
      const { id } = paramsSchema.parse(req.params);
      const dados = bodySchema.parse(req.body);
      const liderIdRestricao = veTudo(req.userRole) ? undefined : Number(req.userId);

      const agendamento = await this.useCase.execute({ id, dados, liderIdRestricao });
      res.status(200).json(agendamento);
    } catch (err) {
      next(err);
    }
  }
}
