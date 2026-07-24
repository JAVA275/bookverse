import { prisma } from "../config/prisma";
import { BookFormat, OrderStatus } from "@prisma/client";

export interface CreateOrderInput {
  userId: string;
  items: { bookId: string; format: BookFormat; unitPriceFcfa: number; quantity: number }[];
  deliveryAddress?: string;
}

export const orderRepository = {
  create(input: CreateOrderInput) {
    const totalAmountFcfa = input.items.reduce((sum, i) => sum + i.unitPriceFcfa * i.quantity, 0);
    return prisma.order.create({
      data: {
        userId: input.userId,
        totalAmountFcfa,
        deliveryAddress: input.deliveryAddress,
        items: {
          create: input.items.map((i) => ({
            bookId: i.bookId,
            format: i.format,
            unitPriceFcfa: i.unitPriceFcfa,
            quantity: i.quantity,
          })),
        },
      },
      include: { items: { include: { book: true } } },
    });
  },

  findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: { items: { include: { book: true } }, payments: true, invoice: true },
    });
  },

  listForUser(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: { items: { include: { book: true } }, payments: true },
      orderBy: { createdAt: "desc" },
    });
  },

  updateStatus(id: string, status: OrderStatus) {
    return prisma.order.update({ where: { id }, data: { status } });
  },
};
