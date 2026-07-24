import { prisma } from "../config/prisma";

export const bookmarkRepository = {
  listForUser(userId: string, bookId?: string) {
    return prisma.bookmark.findMany({
      where: { userId, ...(bookId ? { bookId } : {}) },
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: string) {
    return prisma.bookmark.findUnique({ where: { id } });
  },

  create(data: { userId: string; bookId: string; page: number; label?: string }) {
    return prisma.bookmark.create({ data });
  },

  delete(id: string) {
    return prisma.bookmark.delete({ where: { id } });
  },
};
