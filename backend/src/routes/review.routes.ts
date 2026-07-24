import { Router } from "express";
import { reviewController } from "../controllers/review.controller";
import { requireAuth } from "../middlewares/auth.middleware";

export const reviewRouter = Router();

reviewRouter.get("/", reviewController.listForBook); // ?bookId=...
reviewRouter.post("/", requireAuth, reviewController.create);
reviewRouter.patch("/:id", requireAuth, reviewController.update);
reviewRouter.delete("/:id", requireAuth, reviewController.remove);
