import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { RegistrarLider } from "../../../Application/Modules/Auth/UseCases/RegistrarLider";

const schema = z.object({
  nome: z.string().trim().min(1, "Informe seu nome"),
  email: z.string().trim().email("Informe um e-mail válido"),
  senha: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres"),
});

export class RegistrarController {
  constructor(private readonly useCase: RegistrarLider) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = schema.parse(req.body);
      const lider = await this.useCase.execute(body);
      res.status(201).json({
        id: lider.id,
        nome: lider.nome,
        email: lider.email,
        status: lider.status,
      });
    } catch (err) {
      next(err);
    }
  }
}
