import { NextFunction, Response } from "express";
import { AppError } from "../../Application/Contracts/Errors/AppError";
import { JwtEncrypter } from "../../Infrastructure/Cryptography/JwtEncrypter";
import { AuthenticatedRequest } from "../Contracts/HttpRequest";

const encrypter = new JwtEncrypter();

export async function authMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Token not provided", 401, "UNAUTHORIZED");
    }

    const token = authHeader.split(" ")[1];
    const payload = await encrypter.decrypt(token);

    req.userId = payload.sub as string;
    req.userRole = payload.role as string;
    req.userNome = payload.nome as string;
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401, "UNAUTHORIZED"));
  }
}
