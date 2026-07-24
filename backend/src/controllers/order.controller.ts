import { Response, NextFunction } from "express";
import { orderService } from "../services/order.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { z } from "zod";

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        bookId: z.string().uuid(),
        format: z.enum(["EBOOK", "AUDIO", "PHYSICAL", "BUNDLE"]),
        quantity: z.number().int().min(1).default(1),
      })
    )
    .min(1),
  deliveryAddress: z.string().optional(),
});

export const orderController = {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = createOrderSchema.parse(req.body);
      const order = await orderService.createFromCart(req.user!.id, input.items as any, input.deliveryAddress);
      res.status(201).json({ order });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const order = await orderService.getById(req.params.id, req.user!.id, req.user!.role);
      res.json({ order });
    } catch (err) {
      next(err);
    }
  },

  async listMine(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const orders = await orderService.listForUser(req.user!.id);
      res.json({ orders });
    } catch (err) {
      next(err);
    }
  },
};
