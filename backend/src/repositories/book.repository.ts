import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

export interface BookListFilters {
  search?: string;
  categoryId?: string;
  language?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  bestseller?: boolean;
  sortBy?: "recent" | "popular" | "price_asc" | "price_desc" | "rating";
  page?: number;
  pageSize?: number;
}

export const bookRepository = {
  async list(filters: BookListFilters) {
    const page = filters.page ?? 1;
    const pageSize = Math.min(filters.pageSize ?? 20, 100);

    const where: Prisma.BookWhereInput = {
      isPublished: true,
      ...(filters.search
        ? {
            OR: [
              { title: { contains: filters.search, mode: "insensitive" } },
              { description: { contains: filters.search, mode: "insensitive" } },
              { author: { name: { contains: filters.search, mode: "insensitive" } } },
            ],
          }
        : {}),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters.language ? { language: filters.language } : {}),
      ...(filters.featured !== undefined ? { featured: filters.featured } : {}),
      ...(filters.bestseller !== undefined ? { bestseller: filters.bestseller } : {}),
      ...(filters.minPrice || filters.maxPrice
        ? {
            priceEbookFcfa: {
              gte: filters.minPrice ?? undefined,
              lte: filters.maxPrice ?? undefined,
            },
          }
        : {}),
    };

    const orderBy: Prisma.BookOrderByWithRelationInput =
      filters.sortBy === "price_asc"
        ? { priceEbookFcfa: "asc" }
        : filters.sortBy === "price_desc"
        ? { priceEbookFcfa: "desc" }
        : filters.sortBy === "popular"
        ? { salesCount: "desc" }
        : { createdAt: "desc" };

    const [items, total] = await Promise.all([
      prisma.book.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { category: true, author: { select: { id: true, name: true } } },
      }),
      prisma.book.count({ where }),
    ]);

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  },

  findById(id: string) {
    return prisma.book.findUnique({
      where: { id },
      include: { category: true, author: { select: { id: true, name: true } }, chapters: true, reviews: true },
    });
  },

  create(data: Prisma.BookCreateInput) {
    return prisma.book.create({ data });
  },

  update(id: string, data: Prisma.BookUpdateInput) {
    return prisma.book.update({ where: { id }, data });
  },

  delete(id: string) {
    return prisma.book.delete({ where: { id } });
  },

  incrementSales(id: string, qty = 1) {
    return prisma.book.update({ where: { id }, data: { salesCount: { increment: qty } } });
  },
};
