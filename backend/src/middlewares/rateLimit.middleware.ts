import rateLimit from "express-rate-limit";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 tentatives de login/register par IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de tentatives, réessayez dans quelques minutes." },
});

export const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

export const paymentRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de tentatives de paiement, réessayez plus tard." },
});

// Les routes IA (Gemini) coûtent de l'argent par appel et n'étaient protégées que par
// le rate limiter global (120 req/min sur TOUTES les routes) : un utilisateur authentifié
// pouvait donc épuiser le quota/budget Gemini en boucle. On leur applique une limite dédiée
// et plus stricte, par utilisateur si possible (sinon par IP).
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Trop de requêtes vers l'assistant IA, réessayez dans une minute." },
});
