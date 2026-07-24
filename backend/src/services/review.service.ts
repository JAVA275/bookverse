import { reviewRepository } from "../repositories/review.repository";
import { AppError } from "../utils/AppError";
import { auditLog } from "./audit.service";

export const reviewService = {
  listForBook(bookId: string) {
    return reviewRepository.listForBook(bookId);
  },

  async create(userId: string, input: { bookId: string; rating: number; comment?: string }) {
    const existing = await reviewRepository.findByUserAndBook(userId, input.bookId);
    if (existing) throw AppError.conflict("Vous avez déjà laissé un avis sur ce livre");
    const review = await reviewRepository.create({ ...input, userId });
    await auditLog(userId, "review.create", "Review", review.id);
    return review;
  },

  async update(reviewId: string, userId: string, role: string, data: { rating?: number; comment?: string }) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw AppError.notFound("Avis introuvable");
    const isOwner = review.userId === userId;
    const isPrivileged = ["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(role);
    if (!isOwner && !isPrivileged) throw AppError.forbidden("Vous ne pouvez modifier que vos propres avis");
    const updated = await reviewRepository.update(reviewId, data);
    await auditLog(userId, "review.update", "Review", reviewId);
    return updated;
  },

  async delete(reviewId: string, userId: string, role: string) {
    const review = await reviewRepository.findById(reviewId);
    if (!review) throw AppError.notFound("Avis introuvable");
    const isOwner = review.userId === userId;
    const isPrivileged = ["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(role);
    if (!isOwner && !isPrivileged) throw AppError.forbidden("Vous ne pouvez supprimer que vos propres avis");
    await reviewRepository.delete(reviewId);
    await auditLog(userId, "review.delete", "Review", reviewId);
  },
};
