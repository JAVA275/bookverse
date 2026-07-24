import { Router } from "express";
import { bookController } from "../controllers/book.controller";
import { requireAuth, optionalAuth } from "../middlewares/auth.middleware";
import { requireMinRole } from "../middlewares/rbac.middleware";

export const bookRouter = Router();

bookRouter.get("/", optionalAuth, bookController.list);
bookRouter.get("/:id", optionalAuth, bookController.getById);
bookRouter.post("/", requireAuth, requireMinRole("AUTHOR"), bookController.create);
bookRouter.patch("/:id", requireAuth, requireMinRole("AUTHOR"), bookController.update);
bookRouter.post("/:id/publish", requireAuth, requireMinRole("MODERATOR"), bookController.publish);
