import { Request } from "express";

export type AuthenticatedRequest = Request & {
  userId?: string;
  userRole?: string;
  userNome?: string;
  requestId?: string;
};
