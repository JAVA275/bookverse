export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  constructor(message: string, statusCode = 400, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static unauthorized(message = "Non autorisé") {
    return new AppError(message, 401);
  }
  static forbidden(message = "Accès interdit") {
    return new AppError(message, 403);
  }
  static notFound(message = "Ressource introuvable") {
    return new AppError(message, 404);
  }
  static conflict(message = "Conflit de données") {
    return new AppError(message, 409);
  }
}
