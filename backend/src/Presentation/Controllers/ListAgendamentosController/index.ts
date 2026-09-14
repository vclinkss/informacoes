import { NextFunction, Response } from "express";
import { AppError } from "../../../Application/Contracts/Errors/AppError";
import { ListAgendamentos } from "../../../Application/Modules/Agenda/UseCases/ListAgendamentos";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

/** Admin e o papel "agenda" veem todo mundo; líder comum só vê os próprios agendamentos. */
function veTudo(role?: string): boolean {
  return role === "admin" || role === "agenda";
}

export class ListAgendamentosController {
  constructor(private readonly useCase: ListAgendamentos) {}

  async handle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) throw new AppError("Não autenticado", 401);
      const liderId = veTudo(req.userRole) ? undefined : Number(req.userId);
      const agendamentos = await this.useCase.execute({ liderId });
      res.status(200).json(agendamentos);
    } catch (err) {
      next(err);
    }
  }
}
