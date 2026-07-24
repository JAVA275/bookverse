import { Response, NextFunction } from "express";
import { reviewService } from "../services/review.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { createReviewSchema, updateReviewSchema } from "../validators/review.validator";

export const reviewController = {
  async listForBook(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const reviews = await reviewService.listForBook(req.query.bookId as string);
      res.json({ reviews });
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = createReviewSchema.parse(req.body);
      const review = await reviewService.create(req.user!.id, input);
      res.status(201).json({ review });
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = updateReviewSchema.parse(req.body);
      const review = await reviewService.update(req.params.id, req.user!.id, req.user!.role, input);
      res.json({ review });
    } catch (err) {
      next(err);
    }
  },

  async remove(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      await reviewService.delete(req.params.id, req.user!.id, req.user!.role);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
