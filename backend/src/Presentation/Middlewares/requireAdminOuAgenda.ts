import { NextFunction, Response } from "express";
import { AppError } from "../../Application/Contracts/Errors/AppError";
import { AuthenticatedRequest } from "../Contracts/HttpRequest";

export function requireAdminOuAgenda(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  if (req.userRole !== "admin" && req.userRole !== "agenda") {
    next(new AppError("Acesso restrito ao administrador ou responsável pela agenda", 403));
    return;
  }
  next();
}
