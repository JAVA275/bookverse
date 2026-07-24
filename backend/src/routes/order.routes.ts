import { Router } from "express";
import { orderController } from "../controllers/order.controller";
import { requireAuth } from "../middlewares/auth.middleware";

export const orderRouter = Router();

orderRouter.use(requireAuth);
orderRouter.post("/", orderController.create);
orderRouter.get("/mine", orderController.listMine);
orderRouter.get("/:id", orderController.getById);
