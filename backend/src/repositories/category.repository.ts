import { prisma } from "../config/prisma";

export const categoryRepository = {
  list() {
    return prisma.category.findMany({ orderBy: { name: "asc" } });
  },
  create(data: { name: string; description?: string; iconName?: string }) {
    return prisma.category.create({ data });
  },
  delete(id: string) {
    return prisma.category.delete({ where: { id } });
  },
};
