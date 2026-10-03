import { NextFunction, Response } from "express";
import { AppError } from "../../Application/Contracts/Errors/AppError";
import { AuthenticatedRequest } from "../Contracts/HttpRequest";

/** Papel "mapa" só visualiza o mapa de logística: não acessa lista de contatos nem altera nada. */
export function requireNaoMapa(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  if (req.userRole === "mapa") {
    next(new AppError("Este acesso é somente para visualizar o mapa", 403));
    return;
  }
  next();
}
