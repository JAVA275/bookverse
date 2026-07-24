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
