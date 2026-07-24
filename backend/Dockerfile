# --- Étape 1 : build (toutes les deps, y compris dev, nécessaires pour tsc) ---
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
COPY . .
RUN npm run build

# --- Étape 2 : image finale, minimale ---
# SÉCURITÉ: on ne garde ni les devDependencies, ni le code source TypeScript, ni les outils
# de build dans l'image livrée — ça réduit la surface d'attaque (moins de code/paquets =
# moins de CVE potentielles) et l'image est aussi bien plus légère.
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev && npx prisma generate

COPY --from=build /app/dist ./dist

# SÉCURITÉ: ne jamais faire tourner le process Node en root dans le conteneur. Si une faille
# permettait une exécution de code, un process root pourrait interagir avec le reste du
# système de fichiers/conteneur avec des privilèges élevés. "node" est un utilisateur non-root
# déjà présent dans l'image officielle node:alpine.
USER node

EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
