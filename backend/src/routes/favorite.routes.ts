import { Router } from "express";
import { z } from "zod";
import { favoriteRepository } from "../repositories/favorite.repository";
import { requireAuth, AuthenticatedRequest } from "../middlewares/auth.middleware";
import { serializeBook } from "../utils/serializeBook";

export const favoriteRouter = Router();

favoriteRouter.use(requireAuth);

favoriteRouter.get("/mine", async (req: AuthenticatedRequest, res, next) => {
  try {
    const favorites = await favoriteRepository.listForUser(req.user!.id);
    res.json({
      favorites: favorites.map((f: (typeof favorites)[number]) => ({
        id: f.id,
        createdAt: f.createdAt,
        book: serializeBook(f.book),
      })),
    });
  } catch (err) {
    next(err);
  }
});

favoriteRouter.post("/", async (req: AuthenticatedRequest, res, next) => {
  try {
    const { bookId } = z.object({ bookId: z.string().uuid() }).parse(req.body);
    const existing = await favoriteRepository.find(req.user!.id, bookId);
    if (existing) return res.status(200).json({ favorite: existing, alreadyExisted: true });
    const favorite = await favoriteRepository.create(req.user!.id, bookId);
    res.status(201).json({ favorite });
  } catch (err) {
    next(err);
  }
});

favoriteRouter.delete("/:bookId", async (req: AuthenticatedRequest, res, next) => {
  try {
    await favoriteRepository.remove(req.user!.id, req.params.bookId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
