import { prisma } from "../config/prisma";
import { SubscriptionTier } from "@prisma/client";

export const subscriptionRepository = {
  listPlans() {
    return prisma.subscriptionPlan.findMany({ where: { isActive: true } });
  },

  findPlan(id: SubscriptionTier) {
    return prisma.subscriptionPlan.findUnique({ where: { id } });
  },

  findActiveForUser(userId: string) {
    return prisma.subscription.findFirst({
      where: { userId, status: "active" },
      orderBy: { createdAt: "desc" },
      include: { plan: true },
    });
  },

  async subscribe(userId: string, planId: SubscriptionTier, periodDays: number) {
    const currentPeriodEnd = new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000);
    return prisma.$transaction(async (tx: typeof prisma) => {
      const subscription = await tx.subscription.create({
        data: { userId, planId, currentPeriodEnd, status: "active" },
      });
      await tx.user.update({ where: { id: userId }, data: { subscriptionTier: planId } });
      return subscription;
    });
  },

  async cancel(subscriptionId: string, userId: string) {
    return prisma.subscription.update({
      where: { id: subscriptionId },
      data: { cancelAtPeriodEnd: true },
    });
  },
};
