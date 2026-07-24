import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";
import { logger } from "../config/logger";

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: `Route introuvable: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      error: "Données invalides",
      details: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }

  if (err instanceof AppError) {
    if (err.statusCode >= 500) logger.error(err.message, { stack: err.stack });
    return res.status(err.statusCode).json({ error: err.message, details: err.details });
  }

  const message = err instanceof Error ? err.message : "Erreur interne";
  logger.error(message, { err, path: req.originalUrl });
  return res.status(500).json({ error: "Erreur interne du serveur" });
}
