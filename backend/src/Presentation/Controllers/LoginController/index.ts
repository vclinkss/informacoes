import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { Login } from "../../../Application/Modules/Auth/UseCases/Login";

const schema = z.object({
  email: z.string().trim().email("Informe um e-mail válido"),
  senha: z.string().min(1, "Informe a senha"),
});

export class LoginController {
  constructor(private readonly useCase: Login) {}

  async handle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = schema.parse(req.body);
      const resultado = await this.useCase.execute(body);
      res.status(200).json(resultado);
    } catch (err) {
      next(err);
    }
  }
}
