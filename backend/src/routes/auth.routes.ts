import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { authRateLimiter } from "../middlewares/rateLimit.middleware";

export const authRouter = Router();

authRouter.post("/register", authRateLimiter, authController.register);
authRouter.post("/login", authRateLimiter, authController.login);
authRouter.post("/refresh", authController.refresh);
authRouter.post("/logout", authController.logout);
authRouter.post("/logout-all", requireAuth, authController.logoutAllDevices);
authRouter.post("/forgot-password", authRateLimiter, authController.forgotPassword);
authRouter.post("/reset-password", authRateLimiter, authController.resetPassword);
authRouter.get("/me", requireAuth, authController.me);
