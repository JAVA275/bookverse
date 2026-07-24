import { prisma } from "../config/prisma";
import { EditorialRequestStatus } from "@prisma/client";

export const editorialRequestRepository = {
  create(authorId: string, data: { title: string; pitch: string; bookId?: string; amountFcfa?: number }) {
    return prisma.editorialRequest.create({
      data: {
        authorId,
        title: data.title,
        pitch: data.pitch,
        amountFcfa: data.amountFcfa ?? 0,
        ...(data.bookId ? { book: { connect: { id: data.bookId } } } : {}),
      },
    });
  },

  listForAuthor(authorId: string) {
    return prisma.editorialRequest.findMany({
      where: { authorId },
      orderBy: { createdAt: "desc" },
      include: { book: { select: { id: true, title: true } } },
    });
  },

  findById(id: string) {
    return prisma.editorialRequest.findUnique({ where: { id } });
  },

  listPending() {
    return prisma.editorialRequest.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: {
        author: { select: { id: true, name: true, email: true } },
        book: { select: { id: true, title: true } },
      },
    });
  },

  listAll(params: { page: number; pageSize: number }) {
    return Promise.all([
      prisma.editorialRequest.findMany({
        orderBy: { createdAt: "desc" },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        include: {
          author: { select: { id: true, name: true, email: true } },
          book: { select: { id: true, title: true } },
        },
      }),
      prisma.editorialRequest.count(),
    ]);
  },

  review(id: string, reviewerId: string, status: EditorialRequestStatus, reviewNote?: string) {
    return prisma.editorialRequest.update({
      where: { id },
      data: { status, reviewerId, reviewNote },
    });
  },
};
