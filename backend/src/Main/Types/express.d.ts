import "express";

declare module "express" {
  interface Request {
    userId?: string;
    userRole?: string;
    userNome?: string;
    requestId?: string;
  }
}
