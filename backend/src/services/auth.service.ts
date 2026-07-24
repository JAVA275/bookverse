import bcrypt from "bcryptjs";
import { v4 as uuid } from "uuid";
import { userRepository } from "../repositories/user.repository";
import { tokenRepository } from "../repositories/token.repository";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { AppError } from "../utils/AppError";
import { RegisterInput, LoginInput } from "../validators/auth.validator";
import { auditLog } from "./audit.service";

const REFRESH_TOKEN_TTL_DAYS = 30;
const SALT_ROUNDS = 12;

function refreshExpiry() {
  return new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
}

async function issueTokens(userId: string, role: string, deviceId?: string) {
  const accessToken = signAccessToken({ sub: userId, role });
  const refreshToken = signRefreshToken({ sub: userId });
  await tokenRepository.createRefreshToken(userId, refreshToken, refreshExpiry(), deviceId);
  return { accessToken, refreshToken };
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) throw AppError.conflict("Un compte existe déjà avec cet email");

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      phone: input.phone,
      country: input.country,
    });

    // TODO: déclencher l'envoi d'un email de vérification (voir jobs/email.job.ts)
    await auditLog(user.id, "user.register", "User", user.id);

    const tokens = await issueTokens(user.id, user.role);
    return { user, ...tokens };
  },

  async login(input: LoginInput, deviceId?: string) {
    const user = await userRepository.findByEmail(input.email);
    if (!user) throw AppError.unauthorized("Email ou mot de passe incorrect");
    if (user.isBanned) throw AppError.forbidden("Ce compte a été banni");

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) throw AppError.unauthorized("Email ou mot de passe incorrect");

    const tokens = await issueTokens(user.id, user.role, deviceId);
    await auditLog(user.id, "user.login", "User", user.id);
    return { user, ...tokens };
  },

  async refresh(oldRefreshToken: string) {
    let payload;
    try {
      payload = verifyRefreshToken(oldRefreshToken);
    } catch {
      throw AppError.unauthorized("Refresh token invalide");
    }

    const stored = await tokenRepository.findRefreshToken(oldRefreshToken);
    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw AppError.unauthorized("Refresh token expiré ou révoqué");
    }

    const user = await userRepository.findById(payload.sub);
    if (!user) throw AppError.unauthorized("Utilisateur introuvable");

    // Rotation: on révoque l'ancien token et on en émet un nouveau.
    await tokenRepository.revokeToken(oldRefreshToken);
    const tokens = await issueTokens(user.id, user.role, stored.deviceId ?? undefined);
    return { user, ...tokens };
  },

  async logout(refreshToken: string) {
    const stored = await tokenRepository.findRefreshToken(refreshToken);
    if (stored) await tokenRepository.revokeToken(refreshToken);
  },

  async logoutAllDevices(userId: string) {
    await tokenRepository.revokeAllForUser(userId);
    await auditLog(userId, "user.logout_all_devices", "User", userId);
  },

  async requestPasswordReset(email: string) {
    const user = await userRepository.findByEmail(email);
    // On ne révèle jamais si l'email existe ou non (anti-énumération de comptes).
    if (!user) return;
    const token = uuid();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1h
    await tokenRepository.createPasswordResetToken(user.id, token, expiresAt);
    // TODO: envoyer l'email avec le lien contenant `token` (voir jobs/email.job.ts)
    return token;
  },

  async resetPassword(token: string, newPassword: string) {
    const record = await tokenRepository.findPasswordResetToken(token);
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw AppError.unauthorized("Lien de réinitialisation invalide ou expiré");
    }
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await userRepository.updatePassword(record.userId, passwordHash);
    await tokenRepository.usePasswordResetToken(token);
    await tokenRepository.revokeAllForUser(record.userId);
  },
};
