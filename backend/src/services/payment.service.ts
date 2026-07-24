import { paymentRepository } from "../repositories/payment.repository";
import { orderRepository } from "../repositories/order.repository";
import { stripeService } from "./payments/stripe.service";
import { paypalService } from "./payments/paypal.service";
import { orangeMoneyService } from "./payments/orangeMoney.service";
import { mtnMomoService } from "./payments/mtnMomo.service";
import { AppError } from "../utils/AppError";
import { auditLog } from "./audit.service";
import { env } from "../config/env";

// SÉCURITÉ: toutes les opérations de paiement doivent vérifier que la commande
// appartient bien à l'utilisateur authentifié qui appelle l'API. Sans ce contrôle,
// n'importe quel utilisateur connecté pouvait déclencher/payer/consulter le statut
// de paiement d'une commande appartenant à quelqu'un d'autre (IDOR - broken access
// control, OWASP A01) simplement en devinant/récupérant un orderId.
async function getOwnedOrderOrThrow(orderId: string, userId: string) {
  const order = await orderRepository.findById(orderId);
  if (!order) throw AppError.notFound("Commande introuvable");
  if (order.userId !== userId) throw AppError.forbidden("Cette commande ne vous appartient pas");
  if (order.status !== "PENDING") throw AppError.conflict("Cette commande a déjà été traitée");
  return order;
}

export const paymentService = {
  async startStripeCheckout(orderId: string, userId: string) {
    const order = await getOwnedOrderOrThrow(orderId, userId);
    const payment = await paymentRepository.create(orderId, "STRIPE", order.totalAmountFcfa);
    const session = await stripeService.createCheckoutSession(
      orderId,
      order.totalAmountFcfa,
      `${env.frontendUrl}/checkout/success?order=${orderId}`,
      `${env.frontendUrl}/checkout/cancel?order=${orderId}`
    );
    await paymentRepository.setProviderRef(payment.id, session.id);
    return { checkoutUrl: session.url, paymentId: payment.id };
  },

  async handleStripeWebhookEvent(event: any) {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const payment = await paymentRepository.findByProviderRef(session.id);
      if (payment) {
        await paymentRepository.updateStatus(payment.id, "SUCCEEDED", session);
        await orderRepository.updateStatus(payment.orderId, "PAID");
        await auditLog(null, "payment.stripe.succeeded", "Order", payment.orderId);
      }
    }
  },

  async startPaypalCheckout(orderId: string, userId: string) {
    const order = await getOwnedOrderOrThrow(orderId, userId);
    const payment = await paymentRepository.create(orderId, "PAYPAL", order.totalAmountFcfa);
    const paypalOrder = await paypalService.createOrder(orderId, order.totalAmountFcfa);
    await paymentRepository.setProviderRef(payment.id, paypalOrder.id);
    return { paypalOrderId: paypalOrder.id, paymentId: payment.id };
  },

  async capturePaypalOrder(paypalOrderId: string, userId: string) {
    const payment = await paymentRepository.findByProviderRef(paypalOrderId);
    if (!payment) throw AppError.notFound("Paiement PayPal introuvable");
    const order = await orderRepository.findById(payment.orderId);
    if (!order || order.userId !== userId) throw AppError.forbidden("Ce paiement ne vous appartient pas");
    const result = await paypalService.captureOrder(paypalOrderId);
    const succeeded = result.status === "COMPLETED";
    await paymentRepository.updateStatus(payment.id, succeeded ? "SUCCEEDED" : "FAILED", result);
    if (succeeded) await orderRepository.updateStatus(payment.orderId, "PAID");
    return result;
  },

  async startOrangeMoneyPayment(orderId: string, userId: string) {
    const order = await getOwnedOrderOrThrow(orderId, userId);
    const payment = await paymentRepository.create(orderId, "ORANGE_MONEY", order.totalAmountFcfa);
    const result = await orangeMoneyService.initiatePayment({
      orderId,
      amountFcfa: order.totalAmountFcfa,
      returnUrl: `${env.frontendUrl}/checkout/success?order=${orderId}`,
      cancelUrl: `${env.frontendUrl}/checkout/cancel?order=${orderId}`,
      notifUrl: `${env.frontendUrl.replace(/\/$/, "")}/api/payments/orange-money/webhook`,
    });
    await paymentRepository.setProviderRef(payment.id, result.pay_token);
    return { paymentUrl: result.payment_url, paymentId: payment.id };
  },

  async startMtnMomoPayment(orderId: string, payerMsisdn: string, userId: string) {
    const order = await getOwnedOrderOrThrow(orderId, userId);
    const payment = await paymentRepository.create(orderId, "MTN_MOMO", order.totalAmountFcfa);
    const result = await mtnMomoService.requestToPay({ orderId, amountFcfa: order.totalAmountFcfa, payerMsisdn });
    await paymentRepository.setProviderRef(payment.id, result.referenceId);
    return { referenceId: result.referenceId, paymentId: payment.id };
  },

  // Pour Orange Money et MTN MoMo (pas de webhook fiable en sandbox), le frontend
  // poll ce endpoint toutes les 3-5s après avoir initié le paiement.
  async pollMobileMoneyStatus(paymentId: string, userId: string) {
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) throw AppError.notFound("Paiement introuvable");
    const order = await orderRepository.findById(payment.orderId);
    if (!order || order.userId !== userId) throw AppError.forbidden("Ce paiement ne vous appartient pas");

    const status =
      payment.provider === "ORANGE_MONEY"
        ? (await orangeMoneyService.checkStatus(payment.providerRef!)).status
        : (await mtnMomoService.checkStatus(payment.providerRef!)).status;

    const succeeded = status === "SUCCESS" || status === "SUCCESSFUL";
    const failed = status === "FAILED";

    if (succeeded) {
      await paymentRepository.updateStatus(payment.id, "SUCCEEDED");
      await orderRepository.updateStatus(payment.orderId, "PAID");
    } else if (failed) {
      await paymentRepository.updateStatus(payment.id, "FAILED");
      await orderRepository.updateStatus(payment.orderId, "FAILED");
    }

    return { status };
  },
};
