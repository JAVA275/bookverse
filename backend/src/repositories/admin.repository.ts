import { prisma } from "../config/prisma";

export const adminRepository = {
  async stats() {
    const [usersCount, booksCount, ordersCount, pendingBooksCount, revenueAgg] = await Promise.all([
      prisma.user.count(),
      prisma.book.count(),
      prisma.order.count(),
      prisma.book.count({ where: { isPublished: false } }),
      prisma.order.aggregate({ where: { status: "PAID" }, _sum: { totalAmountFcfa: true } }),
    ]);
    return {
      usersCount,
      booksCount,
      ordersCount,
      pendingBooksCount,
      totalRevenueFcfa: revenueAgg._sum.totalAmountFcfa ?? 0,
    };
  },

  listUsers(params: { search?: string; page: number; pageSize: number }) {
    const where = params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: "insensitive" as const } },
            { email: { contains: params.search, mode: "insensitive" as const } },
          ],
        }
      : {};
    return Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isBanned: true,
          subscriptionTier: true,
          createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);
  },

  setUserBanned(id: string, isBanned: boolean) {
    return prisma.user.update({ where: { id }, data: { isBanned } });
  },

  setUserRole(id: string, role: any) {
    return prisma.user.update({ where: { id }, data: { role } });
  },

  listOrders(params: { page: number; pageSize: number }) {
    return Promise.all([
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: { include: { book: { select: { id: true, title: true } } } },
          payments: true,
        },
      }),
      prisma.order.count(),
    ]);
  },

  listPendingBooks() {
    return prisma.book.findMany({
      where: { isPublished: false },
      include: { author: { select: { id: true, name: true } }, category: true },
      orderBy: { createdAt: "desc" },
    });
  },
};
