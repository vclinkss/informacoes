import { NextFunction, Response } from "express";
import { ILiderRepository } from "../../Application/Contracts/Repositories/ILiderRepository";
import { AppError } from "../../Application/Contracts/Errors/AppError";
import { ehMaster } from "../../Shared/ehMaster";
import { AuthenticatedRequest } from "../Contracts/HttpRequest";

/** Só o e-mail master pode conceder/revogar a restrição de outros admins. */
export function requireMaster(liderRepository: ILiderRepository) {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.userId) throw new AppError("Não autenticado", 401);
      const usuario = await liderRepository.findById(Number(req.userId));
      if (!usuario || !ehMaster(usuario.email)) {
        throw new AppError("Só o administrador master pode fazer isso", 403);
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
