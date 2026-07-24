import { Router } from "express";
import { z } from "zod";
import { highlightRepository } from "../repositories/highlight.repository";
import { requireAuth, AuthenticatedRequest } from "../middlewares/auth.middleware";
import { AppError } from "../utils/AppError";

export const highlightRouter = Router();

highlightRouter.use(requireAuth);

highlightRouter.get("/mine", async (req: AuthenticatedRequest, res, next) => {
  try {
    const highlights = await highlightRepository.listForUser(req.user!.id, req.query.bookId as string | undefined);
    res.json({ highlights });
  } catch (err) {
    next(err);
  }
});

highlightRouter.post("/", async (req: AuthenticatedRequest, res, next) => {
  try {
    const input = z
      .object({
        bookId: z.string().uuid(),
        chapterNumber: z.number().int().min(0),
        pageNumber: z.number().int().min(0),
        selectedText: z.string().min(1),
        noteText: z.string().max(2000).optional(),
        color: z.string().max(20).optional(),
      })
      .parse(req.body);
    const highlight = await highlightRepository.create({ ...input, userId: req.user!.id });
    res.status(201).json({ highlight });
  } catch (err) {
    next(err);
  }
});

highlightRouter.patch("/:id", async (req: AuthenticatedRequest, res, next) => {
  try {
    const highlight = await highlightRepository.findById(req.params.id);
    if (!highlight) throw AppError.notFound("Surlignage introuvable");
    if (highlight.userId !== req.user!.id) throw AppError.forbidden();
    const input = z.object({ noteText: z.string().max(2000).optional(), color: z.string().max(20).optional() }).parse(req.body);
    const updated = await highlightRepository.update(req.params.id, input);
    res.json({ highlight: updated });
  } catch (err) {
    next(err);
  }
});

highlightRouter.delete("/:id", async (req: AuthenticatedRequest, res, next) => {
  try {
    const highlight = await highlightRepository.findById(req.params.id);
    if (!highlight) throw AppError.notFound("Surlignage introuvable");
    if (highlight.userId !== req.user!.id) throw AppError.forbidden();
    await highlightRepository.delete(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
