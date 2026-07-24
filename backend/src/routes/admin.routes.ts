import { Router } from "express";
import { z } from "zod";
import { adminRepository } from "../repositories/admin.repository";
import { requireAuth, AuthenticatedRequest } from "../middlewares/auth.middleware";
import { requireMinRole } from "../middlewares/rbac.middleware";
import { sanitizeUser } from "../utils/sanitizeUser";
import { serializeBook } from "../utils/serializeBook";
import { auditLog } from "../services/audit.service";
import { AppError } from "../utils/AppError";

export const adminRouter = Router();

// Toutes les routes admin exigent d'être authentifié ET d'avoir au minimum le rôle ADMIN.
adminRouter.use(requireAuth, requireMinRole("ADMIN"));

adminRouter.get("/stats", async (_req, res, next) => {
  try {
    const stats = await adminRepository.stats();
    res.json({ stats });
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/users", async (req: AuthenticatedRequest, res, next) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const pageSize = Math.min(req.query.pageSize ? Number(req.query.pageSize) : 20, 100);
    const [users, total] = await adminRepository.listUsers({
      search: req.query.search as string | undefined,
      page,
      pageSize,
    });
    res.json({ users, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch("/users/:id/ban", async (req: AuthenticatedRequest, res, next) => {
  try {
    const { isBanned } = z.object({ isBanned: z.boolean() }).parse(req.body);
    const user = await adminRepository.setUserBanned(req.params.id, isBanned);
    await auditLog(req.user!.id, isBanned ? "admin.user.ban" : "admin.user.unban", "User", req.params.id);
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch("/users/:id/role", async (req: AuthenticatedRequest, res, next) => {
  try {
    // Seul un SUPER_ADMIN peut changer les rôles, pour éviter qu'un ADMIN ne s'auto-élève.
    if (req.user!.role !== "SUPER_ADMIN") throw AppError.forbidden("Seul un super-administrateur peut changer les rôles");
    const { role } = z
      .object({
        role: z.enum(["SUPER_ADMIN", "ADMIN", "MODERATOR", "AUTHOR", "PUBLISHER", "READER_PREMIUM", "READER"]),
      })
      .parse(req.body);
    const user = await adminRepository.setUserRole(req.params.id, role);
    await auditLog(req.user!.id, "admin.user.role_change", "User", req.params.id, { role });
    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/orders", async (req: AuthenticatedRequest, res, next) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const pageSize = Math.min(req.query.pageSize ? Number(req.query.pageSize) : 20, 100);
    const [orders, total] = await adminRepository.listOrders({ page, pageSize });
    res.json({ orders, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/books/pending", async (_req, res, next) => {
  try {
    const books = await adminRepository.listPendingBooks();
    res.json({ books: books.map(serializeBook) });
  } catch (err) {
    next(err);
  }
});
