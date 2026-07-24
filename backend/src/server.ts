import { app } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { prisma } from "./config/prisma";

async function main() {
  await prisma.$connect();
  logger.info("Connexion à la base de données PostgreSQL établie");

  app.listen(env.port, () => {
    logger.info(`BookVerse API démarrée sur le port ${env.port} (env: ${env.nodeEnv})`);
  });
}

main().catch((err) => {
  logger.error("Échec du démarrage du serveur", { err });
  process.exit(1);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
