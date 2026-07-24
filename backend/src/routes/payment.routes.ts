import { Router } from "express";
import { paymentController } from "../controllers/payment.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { paymentRateLimiter } from "../middlewares/rateLimit.middleware";

export const paymentRouter = Router();

// NB: la route webhook Stripe est montée séparément dans server.ts AVANT
// express.json(), car Stripe exige le corps brut (raw body) pour vérifier la signature.

paymentRouter.use(requireAuth, paymentRateLimiter);
paymentRouter.post("/stripe/checkout", paymentController.stripeCheckout);
paymentRouter.post("/paypal/create", paymentController.paypalCreate);
paymentRouter.post("/paypal/capture", paymentController.paypalCapture);
paymentRouter.post("/orange-money/initiate", paymentController.orangeMoneyInitiate);
paymentRouter.post("/mtn-momo/initiate", paymentController.mtnMomoInitiate);
paymentRouter.get("/status/:paymentId", paymentController.pollStatus);
