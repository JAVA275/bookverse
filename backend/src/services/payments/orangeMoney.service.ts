import axios from "axios";
import { env } from "../../config/env";
import { AppError } from "../../utils/AppError";

// Implémentation basée sur l'API officielle "Orange Money Web Payment"
// (Orange Developer Center: https://developer.orange.com/apis/om-webpay).
// IMPORTANT: nécessite un compte marchand Orange Money Cameroun + des
// identifiants obtenus auprès d'Orange (client_id, client_secret, merchant_key).
// Sans ces identifiants réels, ce module ne peut pas être testé bout en bout.
// C'est une démarche commerciale que toi seul (Rakiel / BookVerse) peut engager
// auprès d'Orange Cameroun — je ne peux pas l'obtenir à ta place.

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (!env.orangeMoneyClientId || !env.orangeMoneyClientSecret) {
    throw new AppError("Orange Money n'est pas configuré (identifiants manquants)", 503);
  }
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token;

  const basicAuth = Buffer.from(`${env.orangeMoneyClientId}:${env.orangeMoneyClientSecret}`).toString("base64");
  const { data } = await axios.post(
    "https://api.orange.com/oauth/v3/token",
    "grant_type=client_credentials",
    { headers: { Authorization: `Basic ${basicAuth}`, "Content-Type": "application/x-www-form-urlencoded" } }
  );
  cachedToken = { token: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  return cachedToken.token;
}

export const orangeMoneyService = {
  async initiatePayment(params: {
    orderId: string;
    amountFcfa: number;
    returnUrl: string;
    cancelUrl: string;
    notifUrl: string;
  }) {
    if (!env.orangeMoneyApiBaseUrl || !env.orangeMoneyMerchantKey) {
      throw new AppError("Orange Money n'est pas configuré (merchant key / base URL manquants)", 503);
    }
    const token = await getAccessToken();

    const { data } = await axios.post(
      `${env.orangeMoneyApiBaseUrl}/orange-money-webpay/cm/v1/webpayment`,
      {
        merchant_key: env.orangeMoneyMerchantKey,
        currency: "XAF",
        order_id: params.orderId,
        amount: params.amountFcfa,
        return_url: params.returnUrl,
        cancel_url: params.cancelUrl,
        notif_url: params.notifUrl,
        lang: "fr",
        reference: `BookVerse-${params.orderId}`,
      },
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
    );

    return data; // { payment_url, pay_token, notif_token }
  },

  async checkStatus(payToken: string) {
    const token = await getAccessToken();
    const { data } = await axios.get(
      `${env.orangeMoneyApiBaseUrl}/orange-money-webpay/cm/v1/transactionstatus`,
      {
        params: { order_id: payToken },
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return data; // { status: "SUCCESS" | "FAILED" | "PENDING", ... }
  },
};
