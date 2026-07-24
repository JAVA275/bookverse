import { prisma } from "../src/config/prisma";

// Augmente le timeout par défaut: les tests d'intégration font de vrais appels DB.
jest.setTimeout(20000);

afterAll(async () => {
  await prisma.$disconnect();
});
