import { Router } from "express";
import { z } from "zod";
import { subscriptionRepository } from "../repositories/subscription.repository";
import { requireAuth, AuthenticatedRequest } from "../middlewares/auth.middleware";
import { AppError } from "../utils/AppError";
import { auditLog } from "../services/audit.service";

export const subscriptionRouter = Router();

// Publique: la grille tarifaire ne nécessite pas d'authentification.
subscriptionRouter.get("/plans", async (_req, res, next) => {
  try {
    const plans = await subscriptionRepository.listPlans();
    res.json({ plans });
  } catch (err) {
    next(err);
  }
});

subscriptionRouter.use(requireAuth);

subscriptionRouter.get("/mine", async (req: AuthenticatedRequest, res, next) => {
  try {
    const subscription = await subscriptionRepository.findActiveForUser(req.user!.id);
    res.json({ subscription });
  } catch (err) {
    next(err);
  }
});

subscriptionRouter.post("/", async (req: AuthenticatedRequest, res, next) => {
  try {
    const { planId, periodDays } = z
      .object({
        planId: z.enum(["FREE", "PREMIUM", "PREMIUM_PLUS"]),
        periodDays: z.number().int().min(1).max(366).default(30),
      })
      .parse(req.body);

    const plan = await subscriptionRepository.findPlan(planId);
    if (!plan) throw AppError.notFound("Formule d'abonnement introuvable");

    const subscription = await subscriptionRepository.subscribe(req.user!.id, planId, periodDays);
    await auditLog(req.user!.id, "subscription.subscribe", "Subscription", subscription.id, { planId });
    res.status(201).json({ subscription });
  } catch (err) {
    next(err);
  }
});

subscriptionRouter.post("/cancel", async (req: AuthenticatedRequest, res, next) => {
  try {
    const active = await subscriptionRepository.findActiveForUser(req.user!.id);
    if (!active) throw AppError.notFound("Aucun abonnement actif");
    const cancelled = await subscriptionRepository.cancel(active.id, req.user!.id);
    await auditLog(req.user!.id, "subscription.cancel", "Subscription", active.id);
    res.json({ subscription: cancelled });
  } catch (err) {
    next(err);
  }
});
