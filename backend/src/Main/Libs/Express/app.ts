import cors from "cors";
import express from "express";
import { errorHandler } from "../../../Presentation/Middlewares/errorHandler";
import { requestIdMiddleware } from "../../../Presentation/Middlewares/requestId";
import { router } from "../../Routes";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestIdMiddleware);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/api", router);

  app.use(errorHandler);

  return app;
}
