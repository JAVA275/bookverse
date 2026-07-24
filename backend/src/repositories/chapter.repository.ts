import { prisma } from "../config/prisma";

export const chapterRepository = {
  countForBook(bookId: string) {
    return prisma.chapter.count({ where: { bookId } });
  },

  create(data: { bookId: string; number: number; title: string; content?: string; durationSeconds?: number; audioUrl?: string }) {
    return prisma.chapter.create({ data });
  },

  findById(id: string) {
    return prisma.chapter.findUnique({ where: { id } });
  },
};
