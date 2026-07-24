import { prisma } from "../config/prisma";

export const adminRepository = {
  // SÉCURITÉ / MODÈLE MÉTIER: c'est le SEUL chemin pour créer un compte avec le rôle AUTHOR.
  // L'inscription publique (POST /auth/register) force toujours READER côté serveur — un
  // utilisateur ne peut jamais s'auto-attribuer le rôle auteur. Seul un administrateur peut
  // appeler cette méthode (voir la garde requireMinRole("ADMIN") sur adminRouter).
  createAuthorAccount(data: {
    name: string;
    email: string;
    passwordHash: string;
    phone?: string;
    country?: string;
  }) {
    return prisma.user.create({ data: { ...data, role: "AUTHOR" } });
  },

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

  // "Transactions" (onglet Finances du Dashboard Admin) : on réutilise la table Payment,
  // qui trace déjà chaque paiement réel (Stripe/PayPal/Orange Money/MTN MoMo) — pas besoin
  // d'une table dupliquée, Payment EST le grand livre des transactions de la plateforme.
  listTransactions(params: { page: number; pageSize: number }) {
    return Promise.all([
      prisma.payment.findMany({
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        include: {
          order: { select: { id: true, userId: true, user: { select: { id: true, name: true, email: true } } } },
        },
      }),
      prisma.payment.count(),
    ]);
  },

  listPendingEditorialRequests() {
    return prisma.editorialRequest.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: {
        author: { select: { id: true, name: true, email: true } },
        book: { select: { id: true, title: true } },
      },
    });
  },

  reviewEditorialRequest(id: string, reviewerId: string, status: "APPROVED" | "REJECTED", reviewNote?: string) {
    return prisma.editorialRequest.update({
      where: { id },
      data: { status, reviewerId, reviewNote },
    });
  },
};
