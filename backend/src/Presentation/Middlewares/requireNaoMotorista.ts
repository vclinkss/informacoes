import { NextFunction, Response } from "express";
import { AppError } from "../../Application/Contracts/Errors/AppError";
import { AuthenticatedRequest } from "../Contracts/HttpRequest";

/** Motorista tem acesso só de leitura: não cadastra, não edita, não apaga nada. */
export function requireNaoMotorista(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  if (req.userRole === "motorista") {
    next(new AppError("Acesso de motorista é somente leitura", 403));
    return;
  }
  next();
}
