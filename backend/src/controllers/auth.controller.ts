import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "../validators/auth.validator";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { sanitizeUser } from "../utils/sanitizeUser";
import { env } from "../config/env";

const REFRESH_COOKIE = "bv_refresh_token";
const cookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: "lax" as const,
  path: "/api/auth",
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const input = registerSchema.parse(req.body);
      const { user, accessToken, refreshToken } = await authService.register(input);
      res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
      res.status(201).json({ user: sanitizeUser(user), accessToken });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const input = loginSchema.parse(req.body);
      const deviceId = req.headers["x-device-id"] as string | undefined;
      const { user, accessToken, refreshToken } = await authService.login(input, deviceId);
      res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
      res.json({ user: sanitizeUser(user), accessToken });
    } catch (err) {
      next(err);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.[REFRESH_COOKIE];
      if (!token) return res.status(401).json({ error: "Aucun refresh token fourni" });
      const { user, accessToken, refreshToken } = await authService.refresh(token);
      res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
      res.json({ user: sanitizeUser(user), accessToken });
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies?.[REFRESH_COOKIE];
      if (token) await authService.logout(token);
      res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async logoutAllDevices(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await authService.logoutAllDevices(req.user!.id);
      res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      await authService.requestPasswordReset(email);
      // Réponse volontairement identique que l'email existe ou non.
      res.json({ message: "Si un compte existe, un email de réinitialisation a été envoyé." });
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = resetPasswordSchema.parse(req.body);
      await authService.resetPassword(token, newPassword);
      res.json({ message: "Mot de passe réinitialisé avec succès." });
    } catch (err) {
      next(err);
    }
  },

  async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { userRepository } = await import("../repositories/user.repository");
      const user = await userRepository.findById(req.user!.id);
      if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });
      res.json({ user: sanitizeUser(user) });
    } catch (err) {
      next(err);
    }
  },
};
