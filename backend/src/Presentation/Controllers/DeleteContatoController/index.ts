import { NextFunction, Response } from "express";
import { z } from "zod";
import { AppError } from "../../../Application/Contracts/Errors/AppError";
import { DeleteContato } from "../../../Application/Modules/Contatos/UseCases/DeleteContato";
import { AuthenticatedRequest } from "../../Contracts/HttpRequest";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export class DeleteContatoController {
  constructor(private readonly useCase: DeleteContato) {}

  async handle(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.userId) throw new AppError("Não autenticado", 401);
      const { id } = paramsSchema.parse(req.params);
      const liderIdRestricao = req.userRole === "admin" ? undefined : Number(req.userId);

      await this.useCase.execute({ id, liderIdRestricao });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
