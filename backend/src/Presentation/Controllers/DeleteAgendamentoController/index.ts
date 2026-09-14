import { NextFunction, Response } from "express";
import { z } from "zod";
import { AppError } from "../../../Application/Contracts/Errors/AppError";
import { DeleteAgendamento } from "../../../Application/Modules/Agenda/UseCases/DeleteAgendamento";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

function veTudo(role?: string): boolean {
  return role === "admin" || role === "agenda";
}

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export class DeleteAgendamentoController {
  constructor(private readonly useCase: DeleteAgendamento) {}

  async handle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) throw new AppError("Não autenticado", 401);
      const { id } = paramsSchema.parse(req.params);
      const liderIdRestricao = veTudo(req.userRole) ? undefined : Number(req.userId);

      await this.useCase.execute({ id, liderIdRestricao });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
