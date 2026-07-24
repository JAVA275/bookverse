import { prisma } from "../config/prisma";

const STAFF_ROLES = ["ADMIN", "SUPER_ADMIN", "MODERATOR"];
// Seuls ces paliers d'abonnement payants donnent accès aux livres marqués
// "isFreeWithSubscription" — le palier FREE (celui attribué par défaut à l'inscription)
// n'en fait pas partie : c'est ce qui donne un sens business aux 2 paliers payants.
const SUBSCRIPTION_TIERS_WITH_ACCESS = ["PREMIUM", "PREMIUM_PLUS"];

export type BookAccessReason = "owner" | "staff" | "purchased" | "subscription" | "locked" | "guest";

export interface BookAccess {
  hasFullAccess: boolean;
  reason: BookAccessReason;
}

// SÉCURITÉ / MODÈLE MÉTIER: le contenu complet d'un livre (texte des chapitres, audio) ne
// doit être servi qu'à quelqu'un qui y a légitimement droit. Avant cette fonction, l'API
// renvoyait le contenu intégral de n'importe quel livre publié à n'importe qui, payant ou non.
export async function getBookAccess(
  book: { id: string; authorId: string; isFreeWithSubscription: boolean },
  userId: string | undefined,
  userRole: string | undefined
): Promise<BookAccess> {
  if (!userId) return { hasFullAccess: false, reason: "guest" };
  if (book.authorId === userId) return { hasFullAccess: true, reason: "owner" };
  if (userRole && STAFF_ROLES.includes(userRole)) return { hasFullAccess: true, reason: "staff" };

  const purchased = await prisma.orderItem.findFirst({
    where: { bookId: book.id, order: { userId, status: "PAID" } },
  });
  if (purchased) return { hasFullAccess: true, reason: "purchased" };

  if (book.isFreeWithSubscription) {
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: "active",
        currentPeriodEnd: { gt: new Date() },
        planId: { in: SUBSCRIPTION_TIERS_WITH_ACCESS as any },
      },
    });
    if (activeSubscription) return { hasFullAccess: true, reason: "subscription" };
  }

  return { hasFullAccess: false, reason: "locked" };
}
