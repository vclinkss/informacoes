import { Router } from "express";
import { authMiddleware } from "../../../../Presentation/Middlewares/auth";
import { loginRateLimiter, registerRateLimiter } from "../../../../Presentation/Middlewares/rateLimiter";
import { makeLoginController, makeMeController, makeRegistrarController } from "../Dependencies/composition";

export const authRouter = Router();

const registrarController = makeRegistrarController();
const loginController = makeLoginController();
const meController = makeMeController();

authRouter.post("/registrar", registerRateLimiter, (req, res, next) => registrarController.handle(req, res, next));
authRouter.post("/login", loginRateLimiter, (req, res, next) => loginController.handle(req, res, next));
authRouter.get("/me", authMiddleware, (req, res, next) => meController.handle(req, res, next));
