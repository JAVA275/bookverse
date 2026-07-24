import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seed: plans d'abonnement...");
  await prisma.subscriptionPlan.upsert({
    where: { id: "FREE" },
    update: {},
    create: {
      id: "FREE",
      name: "Gratuit",
      priceMonthlyFcfa: 0,
      priceYearlyFcfa: 0,
      features: ["2 lectures / semaine", "6 lectures / mois", "Accès catalogue limité"],
    },
  });
  await prisma.subscriptionPlan.upsert({
    where: { id: "PREMIUM" },
    update: {},
    create: {
      id: "PREMIUM",
      name: "Premium",
      priceMonthlyFcfa: 2500,
      priceYearlyFcfa: 25000,
      features: ["Lectures illimitées", "Téléchargement hors-ligne", "Sans publicité"],
    },
  });
  await prisma.subscriptionPlan.upsert({
    where: { id: "PREMIUM_PLUS" },
    update: {},
    create: {
      id: "PREMIUM_PLUS",
      name: "Premium+",
      priceMonthlyFcfa: 5000,
      priceYearlyFcfa: 50000,
      features: ["Tout Premium", "Livres audio inclus", "Accès anticipé nouveautés"],
    },
  });

  console.log("Seed: catégories...");
  const categories = [
    ["Roman & Fiction", "Œuvres narratives et fictionnelles"],
    ["Essai & Philosophie", "Réflexions et essais"],
    ["Développement personnel", "Croissance personnelle et bien-être"],
    ["Jeunesse", "Livres pour enfants et adolescents"],
    ["Poésie", "Recueils de poèmes"],
    ["Sciences & Technologie", "Ouvrages scientifiques et techniques"],
  ];
  for (const [name, description] of categories) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name, description } });
  }

  console.log("Seed: comptes de démonstration...");
  const demoPasswordHash = await bcrypt.hash("Password123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@bookverse.cm" },
    update: {},
    create: {
      name: "Admin BookVerse",
      email: "admin@bookverse.cm",
      passwordHash: demoPasswordHash,
      role: "SUPER_ADMIN",
      emailVerifiedAt: new Date(),
    },
  });

  const author = await prisma.user.upsert({
    where: { email: "auteur@bookverse.cm" },
    update: {},
    create: {
      name: "Cheikh Hamidou Kane",
      email: "auteur@bookverse.cm",
      passwordHash: demoPasswordHash,
      role: "AUTHOR",
      emailVerifiedAt: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { email: "lecteur@bookverse.cm" },
    update: {},
    create: {
      name: "Lecteur Test",
      email: "lecteur@bookverse.cm",
      passwordHash: demoPasswordHash,
      role: "READER",
      emailVerifiedAt: new Date(),
    },
  });

  const category = await prisma.category.findUnique({ where: { name: "Roman & Fiction" } });

  console.log("Seed: livre de démonstration...");
  await prisma.book.upsert({
    where: { isbn: "978-2020000000" },
    update: {},
    create: {
      title: "L'Aventure Ambiguë",
      subtitle: "Récit philosophique d'un destin d'Afrique",
      authorId: author.id,
      categoryId: category?.id,
      description:
        "Une œuvre magistrale sur la confrontation entre les valeurs traditionnelles spirituelles et la modernité occidentale.",
      coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
      priceEbookFcfa: 2500,
      pricePhysicalFcfa: 6500,
      priceAudioFcfa: 3000,
      isFreeWithSubscription: true,
      pages: 192,
      isbn: "978-2020000000",
      language: "fr",
      stockPhysical: 50,
      featured: true,
      isPublished: true,
      publishDate: new Date(),
    },
  });

  console.log(`Seed terminé. Compte admin: admin@bookverse.cm / Password123 (ID: ${admin.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
