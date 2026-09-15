import cors from "cors";
import express from "express";
import helmet from "helmet";
import { errorHandler } from "../../../Presentation/Middlewares/errorHandler";
import { requestIdMiddleware } from "../../../Presentation/Middlewares/requestId";
import { router } from "../../Routes";

export function createApp() {
  const app = express();

  // Render/Vercel/CloudPrime ficam atrás de um proxy reverso; sem isso o limitador
  // de tentativas (rate limit) enxergaria o IP do proxy, não o do visitante real.
  app.set("trust proxy", 1);

  // A API é consumida por domínios diferentes de propósito (painel admin e link
  // dos líderes), então liberamos leitura cross-origin dos cabeçalhos de segurança.
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(requestIdMiddleware);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/api", router);

  app.use(errorHandler);

  return app;
}
