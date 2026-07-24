import { prisma } from "../config/prisma";

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },
  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },
  create(data: {
    name: string;
    email: string;
    passwordHash: string;
    phone?: string;
    country?: string;
  }) {
    return prisma.user.create({ data });
  },
  updatePassword(id: string, passwordHash: string) {
    return prisma.user.update({ where: { id }, data: { passwordHash } });
  },
  markEmailVerified(id: string) {
    return prisma.user.update({ where: { id }, data: { emailVerifiedAt: new Date() } });
  },
  update(id: string, data: Partial<{ name: string; avatar: string; bio: string; phone: string; country: string }>) {
    return prisma.user.update({ where: { id }, data });
  },
};
