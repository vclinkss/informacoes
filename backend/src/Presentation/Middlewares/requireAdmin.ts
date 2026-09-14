import { NextFunction, Response } from "express";
import { AppError } from "../../Application/Contracts/Errors/AppError";
import { AuthenticatedRequest } from "../Contracts/HttpRequest";

export function requireAdmin(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  if (req.userRole !== "admin") {
    next(new AppError("Acesso restrito ao administrador", 403));
    return;
  }
  next();
}
