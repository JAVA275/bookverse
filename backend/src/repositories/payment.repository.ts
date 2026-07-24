import { prisma } from "../config/prisma";
import { PaymentProvider, PaymentStatus } from "@prisma/client";

export const paymentRepository = {
  findById(id: string) {
    return prisma.payment.findUnique({ where: { id } });
  },

  create(orderId: string, provider: PaymentProvider, amountFcfa: number, providerRef?: string) {
    return prisma.payment.create({
      data: { orderId, provider, amountFcfa, providerRef, status: "PENDING" },
    });
  },

  findByProviderRef(providerRef: string) {
    return prisma.payment.findFirst({ where: { providerRef } });
  },

  updateStatus(id: string, status: PaymentStatus, rawPayload?: unknown) {
    return prisma.payment.update({ where: { id }, data: { status, rawPayload: rawPayload as any } });
  },

  setProviderRef(id: string, providerRef: string) {
    return prisma.payment.update({ where: { id }, data: { providerRef } });
  },
};
