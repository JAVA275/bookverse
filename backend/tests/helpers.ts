import bcrypt from "bcryptjs";
import { prisma } from "../src/config/prisma";

// Vide les tables entre les tests, dans un ordre compatible avec les contraintes de clé étrangère.
// NB: TRUNCATE ... CASCADE est plus rapide que deleteMany() répétés pour un jeu de 20 tables.
export async function resetDb() {
  await prisma.$transaction([
    prisma.auditLog.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.subscription.deleteMany(),
    prisma.highlight.deleteMany(),
    prisma.bookmark.deleteMany(),
    prisma.readingHistory.deleteMany(),
    prisma.favorite.deleteMany(),
    prisma.review.deleteMany(),
    prisma.chapter.deleteMany(),
    prisma.book.deleteMany(),
    prisma.category.deleteMany(),
    prisma.device.deleteMany(),
    prisma.emailVerificationToken.deleteMany(),
    prisma.passwordResetToken.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

export async function createUserFixture(overrides: {
  email: string;
  name?: string;
  password?: string;
  role?: "READER" | "AUTHOR" | "MODERATOR" | "ADMIN" | "SUPER_ADMIN" | "PUBLISHER" | "READER_PREMIUM";
}) {
  const passwordHash = await bcrypt.hash(overrides.password ?? "Password123", 4); // coût réduit: tests uniquement
  return prisma.user.create({
    data: {
      name: overrides.name ?? "Utilisateur Test",
      email: overrides.email,
      passwordHash,
      role: overrides.role ?? "READER",
    },
  });
}

export async function createBookFixture(authorId: string, overrides: Partial<{ title: string; priceEbookFcfa: number; isPublished: boolean }> = {}) {
  return prisma.book.create({
    data: {
      title: overrides.title ?? "Livre de Test",
      description: "Description de test",
      authorId,
      priceEbookFcfa: overrides.priceEbookFcfa ?? 1000,
      isPublished: overrides.isPublished ?? true,
    },
  });
}
