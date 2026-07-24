import { Router } from "express";
import { z } from "zod";
import { categoryRepository } from "../repositories/category.repository";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireMinRole } from "../middlewares/rbac.middleware";

export const categoryRouter = Router();

const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  iconName: z.string().max(100).optional(),
});

categoryRouter.get("/", async (_req, res, next) => {
  try {
    const categories = await categoryRepository.list();
    res.json({ categories });
  } catch (err) {
    next(err);
  }
});

categoryRouter.post("/", requireAuth, requireMinRole("ADMIN"), async (req, res, next) => {
  try {
    const input = createCategorySchema.parse(req.body);
    const category = await categoryRepository.create(input);
    res.status(201).json({ category });
  } catch (err) {
    next(err);
  }
});

categoryRouter.delete("/:id", requireAuth, requireMinRole("ADMIN"), async (req, res, next) => {
  try {
    await categoryRepository.delete(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});
