import { prisma } from "../config/prisma";

export const reviewRepository = {
  listForBook(bookId: string) {
    return prisma.review.findMany({
      where: { bookId },
      include: { user: { select: { id: true, name: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: string) {
    return prisma.review.findUnique({ where: { id } });
  },

  findByUserAndBook(userId: string, bookId: string) {
    return prisma.review.findUnique({ where: { bookId_userId: { bookId, userId } } });
  },

  create(data: { bookId: string; userId: string; rating: number; comment?: string }) {
    return prisma.review.create({ data });
  },

  update(id: string, data: { rating?: number; comment?: string }) {
    return prisma.review.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.review.delete({ where: { id } });
  },
};
