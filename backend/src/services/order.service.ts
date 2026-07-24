import { orderRepository } from "../repositories/order.repository";
import { bookRepository } from "../repositories/book.repository";
import { AppError } from "../utils/AppError";
import { auditLog } from "./audit.service";
import { BookFormat } from "@prisma/client";

interface CartItemInput {
  bookId: string;
  format: BookFormat;
  quantity: number;
}

export const orderService = {
  async createFromCart(userId: string, items: CartItemInput[], deliveryAddress?: string) {
    if (!items.length) throw new AppError("Le panier est vide", 400);

    const resolvedItems = await Promise.all(
      items.map(async (item) => {
        const book = await bookRepository.findById(item.bookId);
        if (!book) throw AppError.notFound(`Livre introuvable: ${item.bookId}`);
        const unitPrice =
          item.format === "EBOOK"
            ? book.priceEbookFcfa
            : item.format === "AUDIO"
            ? book.priceAudioFcfa
            : book.pricePhysicalFcfa;
        return { bookId: item.bookId, format: item.format, unitPriceFcfa: unitPrice, quantity: item.quantity };
      })
    );

    const order = await orderRepository.create({ userId, items: resolvedItems, deliveryAddress });
    await auditLog(userId, "order.create", "Order", order.id, { total: order.totalAmountFcfa });
    return order;
  },

  async getById(orderId: string, userId: string, role: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw AppError.notFound("Commande introuvable");
    const isOwner = order.userId === userId;
    const isPrivileged = ["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(role);
    if (!isOwner && !isPrivileged) throw AppError.forbidden();
    return order;
  },

  listForUser(userId: string) {
    return orderRepository.listForUser(userId);
  },
};
