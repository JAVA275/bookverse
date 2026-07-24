import { Request, Response, NextFunction } from "express";
import { paymentService } from "../services/payment.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { stripeService } from "../services/payments/stripe.service";
import { z } from "zod";

const orderIdSchema = z.object({ orderId: z.string().uuid() });

export const paymentController = {
  async stripeCheckout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { orderId } = orderIdSchema.parse(req.body);
      const result = await paymentService.startStripeCheckout(orderId, req.user!.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async stripeWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers["stripe-signature"] as string;
      const event = stripeService.constructWebhookEvent(req.body, signature);
      await paymentService.handleStripeWebhookEvent(event);
      res.json({ received: true });
    } catch (err) {
      next(err);
    }
  },

  async paypalCreate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { orderId } = orderIdSchema.parse(req.body);
      const result = await paymentService.startPaypalCheckout(orderId, req.user!.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async paypalCapture(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { paypalOrderId } = z.object({ paypalOrderId: z.string() }).parse(req.body);
      const result = await paymentService.capturePaypalOrder(paypalOrderId, req.user!.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async orangeMoneyInitiate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { orderId } = orderIdSchema.parse(req.body);
      const result = await paymentService.startOrangeMoneyPayment(orderId, req.user!.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async mtnMomoInitiate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { orderId, payerMsisdn } = z
        .object({ orderId: z.string().uuid(), payerMsisdn: z.string().min(9) })
        .parse(req.body);
      const result = await paymentService.startMtnMomoPayment(orderId, payerMsisdn, req.user!.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async pollStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await paymentService.pollMobileMoneyStatus(req.params.paymentId, req.user!.id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};
