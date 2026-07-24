import { Router } from "express";
import { z } from "zod";
import { editorialRequestRepository } from "../repositories/editorialRequest.repository";
import { requireAuth, AuthenticatedRequest } from "../middlewares/auth.middleware";
import { requireMinRole } from "../middlewares/rbac.middleware";
import { auditLog } from "../services/audit.service";

export const editorialRequestRouter = Router();

// Réservé aux auteurs/éditeurs/rôles supérieurs : un simple lecteur ne peut pas
// soumettre de manuscrit pour publication.
editorialRequestRouter.use(requireAuth, requireMinRole("AUTHOR"));

const createSchema = z.object({
  title: z.string().min(1).max(300),
  pitch: z.string().min(1).max(5000),
  bookId: z.string().uuid().optional(),
  amountFcfa: z.number().int().min(0).max(10_000_000).optional(),
});

editorialRequestRouter.post("/", async (req: AuthenticatedRequest, res, next) => {
  try {
    const input = createSchema.parse(req.body);
    const request = await editorialRequestRepository.create(req.user!.id, input);
    await auditLog(req.user!.id, "editorial_request.create", "EditorialRequest", request.id);
    res.status(201).json({ request });
  } catch (err) {
    next(err);
  }
});

editorialRequestRouter.get("/mine", async (req: AuthenticatedRequest, res, next) => {
  try {
    const requests = await editorialRequestRepository.listForAuthor(req.user!.id);
    res.json({ requests });
  } catch (err) {
    next(err);
  }
});
