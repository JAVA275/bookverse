import { Router } from "express";
import { z } from "zod";
import { bookmarkRepository } from "../repositories/bookmark.repository";
import { requireAuth, AuthenticatedRequest } from "../middlewares/auth.middleware";
import { AppError } from "../utils/AppError";

export const bookmarkRouter = Router();

bookmarkRouter.use(requireAuth);

bookmarkRouter.get("/mine", async (req: AuthenticatedRequest, res, next) => {
  try {
    const bookmarks = await bookmarkRepository.listForUser(req.user!.id, req.query.bookId as string | undefined);
    res.json({ bookmarks });
  } catch (err) {
    next(err);
  }
});

bookmarkRouter.post("/", async (req: AuthenticatedRequest, res, next) => {
  try {
    const input = z
      .object({ bookId: z.string().uuid(), page: z.number().int().min(0), label: z.string().max(200).optional() })
      .parse(req.body);
    const bookmark = await bookmarkRepository.create({ ...input, userId: req.user!.id });
    res.status(201).json({ bookmark });
  } catch (err) {
    next(err);
  }
});

bookmarkRouter.delete("/:id", async (req: AuthenticatedRequest, res, next) => {
  try {
    const bookmark = await bookmarkRepository.findById(req.params.id);
    if (!bookmark) throw AppError.notFound("Signet introuvable");
    if (bookmark.userId !== req.user!.id) throw AppError.forbidden();
    await bookmarkRepository.delete(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
