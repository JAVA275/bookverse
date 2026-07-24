import { UserProfile, UserRole, SubscriptionTier } from "../types";

const ROLE_MAP: Record<string, UserRole> = {
  SUPER_ADMIN: "admin",
  ADMIN: "admin",
  MODERATOR: "admin",
  AUTHOR: "author",
  PUBLISHER: "publisher",
  READER_PREMIUM: "reader",
  READER: "reader",
};

const TIER_MAP: Record<string, SubscriptionTier> = {
  FREE: "free",
  PREMIUM: "premium",
  PREMIUM_PLUS: "premium_plus",
};

// Le backend fait autorité sur id/email/rôle/abonnement. Les champs qui n'existent
// pas encore côté API (bibliothèque, signets...) restent gérés localement pour
// l'instant tant que ces routes ne sont pas branchées.
export function mapApiUserToProfile(apiUser: any, previous?: UserProfile): UserProfile {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    role: ROLE_MAP[apiUser.role] ?? "reader",
    avatar:
      apiUser.avatar ??
      previous?.avatar ??
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
    subscriptionTier: TIER_MAP[apiUser.subscriptionTier] ?? "free",
    walletBalance: apiUser.walletBalanceFcfa ?? 0,
    phone: apiUser.phone ?? previous?.phone ?? "",
    country: apiUser.country ?? previous?.country ?? "",
    bio: apiUser.bio ?? previous?.bio,
    myLibraryBookIds: previous?.myLibraryBookIds ?? [],
    myAudiobookIds: previous?.myAudiobookIds ?? [],
    bookmarkedPageByBookId: previous?.bookmarkedPageByBookId ?? {},
    weeklyReadsCount: apiUser.weeklyReadsCount ?? 0,
    totalReadsCount: apiUser.totalReadsCount ?? 0,
    publishedBooksCount: previous?.publishedBooksCount,
  };
}
