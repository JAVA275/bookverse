import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import morgan from "morgan";
import { env } from "./config/env";
import { apiRouter } from "./routes";
import { paymentController } from "./controllers/payment.controller";
import { globalRateLimiter } from "./middlewares/rateLimit.middleware";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

export const app = express();

// SÉCURITÉ / FIABILITÉ: Railway et Render exposent l'app derrière un reverse proxy qui
// termine le TLS et transmet la vraie IP du client via X-Forwarded-For. Sans "trust proxy",
// Express voit l'IP du proxy pour TOUTES les requêtes : express-rate-limit regrouperait alors
// tous les utilisateurs dans un seul et même compteur (un attaquant peut faire bloquer tout
// le monde, ou pire, le rate limiting sur /auth/login devient inutile car partagé). On ne
// fait confiance qu'au premier saut (le proxy Railway/Render lui-même), jamais à un nombre
// arbitraire de sauts, pour éviter qu'un client spoof un en-tête X-Forwarded-For.
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true,
  })
);
app.use(compression());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(globalRateLimiter);

// IMPORTANT: le webhook Stripe doit recevoir le corps BRUT (non parsé en JSON)
// pour pouvoir vérifier la signature `stripe-signature`. On le monte donc
// AVANT express.json(), avec express.raw() dédié à cette seule route.
app.post(
  "/api/payments/stripe/webhook",
  express.raw({ type: "application/json" }),
  paymentController.stripeWebhook
);

app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.use("/api", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);
