import { Router } from "express";
import { categoryRepository } from "../repositories/category.repository";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireMinRole } from "../middlewares/rbac.middleware";

export const categoryRouter = Router();

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
    const category = await categoryRepository.create(req.body);
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
