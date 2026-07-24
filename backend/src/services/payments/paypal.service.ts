import paypal from "@paypal/checkout-server-sdk";
import { env } from "../../config/env";
import { AppError } from "../../utils/AppError";

function getClient() {
  if (!env.paypalClientId || !env.paypalClientSecret) {
    throw new AppError("PayPal n'est pas configuré (PAYPAL_CLIENT_ID/SECRET manquants)", 503);
  }
  const Environment =
    env.paypalEnv === "live" ? paypal.core.LiveEnvironment : paypal.core.SandboxEnvironment;
  const environment = new Environment(env.paypalClientId, env.paypalClientSecret);
  return new paypal.core.PayPalHttpClient(environment);
}

// NB: PayPal ne supporte pas nativement le FCFA/XAF. On convertit en USD pour la
// transaction PayPal (taux à définir dans PAYPAL_FCFA_TO_USD_RATE), le prix affiché
// au client reste en FCFA côté frontend.
function fcfaToUsd(amountFcfa: number): string {
  const rate = parseFloat(process.env.PAYPAL_FCFA_TO_USD_RATE ?? "0.0016");
  return (amountFcfa * rate).toFixed(2);
}

export const paypalService = {
  async createOrder(orderId: string, amountFcfa: number) {
    const client = getClient();
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: orderId,
          amount: { currency_code: "USD", value: fcfaToUsd(amountFcfa) },
        },
      ],
    });
    const response = await client.execute(request);
    return response.result; // contient .id (à renvoyer au frontend pour le bouton PayPal)
  },

  async captureOrder(paypalOrderId: string) {
    const client = getClient();
    const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
    // @ts-expect-error - requestBody({}) est requis par le SDK même vide
    request.requestBody({});
    const response = await client.execute(request);
    return response.result;
  },
};
