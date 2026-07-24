import crypto from "crypto";
import { prisma } from "../config/prisma";

// SÉCURITÉ: on ne stocke jamais les tokens (refresh / reset password) en clair en base.
// Un dump de base, une sauvegarde mal protégée ou un accès en lecture seule (ex. réplique,
// outil BI, employé malveillant) donnerait sinon un accès direct et immédiat aux comptes,
// sans même avoir besoin du secret JWT. On stocke un hash SHA-256 et on cherche par hash ;
// le token en clair ne transite jamais que dans le cookie httpOnly / la réponse HTTP.
function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export const tokenRepository = {
  createRefreshToken(userId: string, token: string, expiresAt: Date, deviceId?: string) {
    return prisma.refreshToken.create({ data: { userId, token: hashToken(token), expiresAt, deviceId } });
  },
  findRefreshToken(token: string) {
    return prisma.refreshToken.findUnique({ where: { token: hashToken(token) } });
  },
  revokeToken(token: string) {
    return prisma.refreshToken.update({ where: { token: hashToken(token) }, data: { revoked: true } });
  },
  revokeAllForUser(userId: string) {
    return prisma.refreshToken.updateMany({ where: { userId }, data: { revoked: true } });
  },
  createPasswordResetToken(userId: string, token: string, expiresAt: Date) {
    return prisma.passwordResetToken.create({ data: { userId, token: hashToken(token), expiresAt } });
  },
  findPasswordResetToken(token: string) {
    return prisma.passwordResetToken.findUnique({ where: { token: hashToken(token) } });
  },
  usePasswordResetToken(token: string) {
    return prisma.passwordResetToken.update({ where: { token: hashToken(token) }, data: { usedAt: new Date() } });
  },
};
