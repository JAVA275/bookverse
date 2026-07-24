import { prisma } from "../config/prisma";

export const highlightRepository = {
  listForUser(userId: string, bookId?: string) {
    return prisma.highlight.findMany({
      where: { userId, ...(bookId ? { bookId } : {}) },
      orderBy: { createdAt: "desc" },
    });
  },

  findById(id: string) {
    return prisma.highlight.findUnique({ where: { id } });
  },

  create(data: {
    userId: string;
    bookId: string;
    chapterNumber: number;
    pageNumber: number;
    selectedText: string;
    noteText?: string;
    color?: string;
  }) {
    return prisma.highlight.create({ data });
  },

  update(id: string, data: { noteText?: string; color?: string }) {
    return prisma.highlight.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.highlight.delete({ where: { id } });
  },
};
