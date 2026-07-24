import { prisma } from "../config/prisma";

export const favoriteRepository = {
  listForUser(userId: string) {
    return prisma.favorite.findMany({
      where: { userId },
      include: { book: { include: { category: true, author: { select: { id: true, name: true } } } } },
      orderBy: { createdAt: "desc" },
    });
  },

  find(userId: string, bookId: string) {
    return prisma.favorite.findUnique({ where: { userId_bookId: { userId, bookId } } });
  },

  create(userId: string, bookId: string) {
    return prisma.favorite.create({ data: { userId, bookId } });
  },

  remove(userId: string, bookId: string) {
    return prisma.favorite.delete({ where: { userId_bookId: { userId, bookId } } });
  },
};
