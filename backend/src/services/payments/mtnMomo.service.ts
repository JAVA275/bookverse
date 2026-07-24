import axios from "axios";
import { v4 as uuid } from "uuid";
import { env } from "../../config/env";
import { AppError } from "../../utils/AppError";

// Implémentation basée sur l'API officielle "MTN MoMo Collections"
// (MTN MoMo Developer Portal: https://momodeveloper.mtn.com).
// IMPORTANT: nécessite un compte développeur MTN MoMo + un abonnement "Collections"
// (subscription key), puis un API user + API key provisionnés dans le sandbox.
// Comme pour Orange Money, ce sont des identifiants réels que toi seul peux
// obtenir auprès de MTN Cameroun — impossible à générer depuis ce projet.

async function getAccessToken(): Promise<string> {
  if (!env.mtnMomoSubscriptionKey || !env.mtnMomoApiUser || !env.mtnMomoApiKey) {
    throw new AppError("MTN MoMo n'est pas configuré (identifiants manquants)", 503);
  }
  const basicAuth = Buffer.from(`${env.mtnMomoApiUser}:${env.mtnMomoApiKey}`).toString("base64");
  const { data } = await axios.post(
    `${env.mtnMomoApiBaseUrl}/collection/token/`,
    {},
    {
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Ocp-Apim-Subscription-Key": env.mtnMomoSubscriptionKey,
      },
    }
  );
  return data.access_token as string;
}

export const mtnMomoService = {
  async requestToPay(params: { orderId: string; amountFcfa: number; payerMsisdn: string }) {
    const token = await getAccessToken();
    const referenceId = uuid();

    await axios.post(
      `${env.mtnMomoApiBaseUrl}/collection/v1_0/requesttopay`,
      {
        amount: params.amountFcfa.toString(),
        currency: "XAF",
        externalId: params.orderId,
        payer: { partyIdType: "MSISDN", partyId: params.payerMsisdn },
        payerMessage: `Paiement commande BookVerse #${params.orderId}`,
        payeeNote: "BookVerse",
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Reference-Id": referenceId,
          "X-Target-Environment": env.mtnMomoTargetEnv,
          "Ocp-Apim-Subscription-Key": env.mtnMomoSubscriptionKey,
          "Content-Type": "application/json",
        },
      }
    );

    return { referenceId }; // à stocker comme providerRef pour interroger le statut ensuite
  },

  async checkStatus(referenceId: string) {
    const token = await getAccessToken();
    const { data } = await axios.get(
      `${env.mtnMomoApiBaseUrl}/collection/v1_0/requesttopay/${referenceId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Target-Environment": env.mtnMomoTargetEnv,
          "Ocp-Apim-Subscription-Key": env.mtnMomoSubscriptionKey,
        },
      }
    );
    return data; // { status: "SUCCESSFUL" | "FAILED" | "PENDING", ... }
  },
};
