import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware";
import { AppError } from "../utils/AppError";

// Hiérarchie simple: plus l'index est élevé, plus le rôle a de privilèges.
const ROLE_ORDER = [
  "READER",
  "READER_PREMIUM",
  "AUTHOR",
  "PUBLISHER",
  "MODERATOR",
  "ADMIN",
  "SUPER_ADMIN",
];

export function requireRole(...allowed: string[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) return next(AppError.unauthorized());
    if (!allowed.includes(req.user.role)) {
      return next(AppError.forbidden(`Rôle requis: ${allowed.join(" ou ")}`));
    }
    next();
  };
}

export function requireMinRole(minRole: string) {
  const minIndex = ROLE_ORDER.indexOf(minRole);
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) return next(AppError.unauthorized());
    const userIndex = ROLE_ORDER.indexOf(req.user.role);
    if (userIndex < minIndex) {
      return next(AppError.forbidden(`Rôle minimum requis: ${minRole}`));
    }
    next();
  };
}
