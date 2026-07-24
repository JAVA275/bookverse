import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { AppError } from "../utils/AppError";

export interface AuthenticatedRequest extends Request {
  user?: { id: string; role: string };
}

export function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(AppError.unauthorized("Token d'accès manquant"));
  }
  const token = header.slice("Bearer ".length);
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    next(AppError.unauthorized("Token d'accès invalide ou expiré"));
  }
}

// Authentification optionnelle: continue même sans token (utile pour routes publiques
// qui personnalisent la réponse si l'utilisateur est connecté).
export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const payload = verifyAccessToken(header.slice("Bearer ".length));
      req.user = { id: payload.sub, role: payload.role };
    } catch {
      // token invalide -> on ignore, requête traitée comme anonyme
    }
  }
  next();
}
