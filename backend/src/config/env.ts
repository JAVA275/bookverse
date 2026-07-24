import dotenv from "dotenv";
dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Variable d'environnement manquante: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parseInt(process.env.PORT ?? "4000", 10),

  databaseUrl: required("DATABASE_URL"),

  jwtAccessSecret: required("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET"),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? "30d",

  frontendUrl: process.env.FRONTEND_URL ?? "http://localhost:5173",
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:5173").split(","),

  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",

  paypalClientId: process.env.PAYPAL_CLIENT_ID ?? "",
  paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET ?? "",
  paypalEnv: process.env.PAYPAL_ENV ?? "sandbox",

  orangeMoneyMerchantKey: process.env.ORANGE_MONEY_MERCHANT_KEY ?? "",
  orangeMoneyApiBaseUrl: process.env.ORANGE_MONEY_API_BASE_URL ?? "",
  orangeMoneyClientId: process.env.ORANGE_MONEY_CLIENT_ID ?? "",
  orangeMoneyClientSecret: process.env.ORANGE_MONEY_CLIENT_SECRET ?? "",

  mtnMomoSubscriptionKey: process.env.MTN_MOMO_SUBSCRIPTION_KEY ?? "",
  mtnMomoApiBaseUrl: process.env.MTN_MOMO_API_BASE_URL ?? "",
  mtnMomoApiUser: process.env.MTN_MOMO_API_USER ?? "",
  mtnMomoApiKey: process.env.MTN_MOMO_API_KEY ?? "",
  mtnMomoTargetEnv: process.env.MTN_MOMO_TARGET_ENV ?? "sandbox",

  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
};
