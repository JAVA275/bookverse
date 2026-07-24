import Stripe from "stripe";
import { env } from "../../config/env";
import { AppError } from "../../utils/AppError";

let stripeClient: Stripe | null = null;
function getStripe(): Stripe {
  if (!env.stripeSecretKey) {
    throw new AppError("Stripe n'est pas configuré (STRIPE_SECRET_KEY manquant)", 503);
  }
  if (!stripeClient) stripeClient = new Stripe(env.stripeSecretKey, { apiVersion: "2024-06-20" });
  return stripeClient;
}

// Stripe facture en unité mineure. FCFA n'a pas de sous-unité (0 décimale), comme XOF/XAF sur Stripe.
export const stripeService = {
  async createCheckoutSession(orderId: string, amountFcfa: number, successUrl: string, cancelUrl: string) {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "xaf",
            product_data: { name: `Commande BookVerse #${orderId}` },
            unit_amount: amountFcfa, // XAF = devise zéro décimale chez Stripe
          },
          quantity: 1,
        },
      ],
      metadata: { orderId },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    return session;
  },

  constructWebhookEvent(rawBody: Buffer, signature: string) {
    const stripe = getStripe();
    if (!env.stripeWebhookSecret) {
      throw new AppError("STRIPE_WEBHOOK_SECRET manquant", 503);
    }
    return stripe.webhooks.constructEvent(rawBody, signature, env.stripeWebhookSecret);
  },
};
