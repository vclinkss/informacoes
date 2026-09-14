import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../../Application/Contracts/Errors/AppError";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
      },
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(422).json({
      error: {
        message: "Validation error",
        fields: err.flatten().fieldErrors,
      },
    });
    return;
  }

  console.error("[Unhandled Error]", err);

  res.status(500).json({
    error: {
      message: "Internal server error",
    },
  });
}
