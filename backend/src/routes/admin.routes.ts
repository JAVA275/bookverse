import { Router } from "express";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { adminRepository } from "../repositories/admin.repository";
import { userRepository } from "../repositories/user.repository";
import { requireAuth, AuthenticatedRequest } from "../middlewares/auth.middleware";
import { requireMinRole } from "../middlewares/rbac.middleware";
import { sanitizeUser } from "../utils/sanitizeUser";
import { serializeBook } from "../utils/serializeBook";
import { auditLog } from "../services/audit.service";
import { AppError } from "../utils/AppError";

export const adminRouter = Router();

// Toutes les routes admin exigent d'être authentifié ET d'avoir au minimum le rôle ADMIN.
adminRouter.use(requireAuth, requireMinRole("ADMIN"));

const createAuthorSchema = z.object({
  name: z.string().min(2).max(200),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  country: z.string().max(100).optional(),
});

// Seul un ADMIN/SUPER_ADMIN peut créer un compte AUTEUR — c'est la seule route qui le permet
// (l'inscription publique force toujours READER). On génère un mot de passe temporaire fort
// côté serveur plutôt que de laisser l'admin en choisir un faible ; à communiquer à l'auteur
// par un canal sûr, à faire changer dès sa première connexion.
adminRouter.post("/authors", async (req: AuthenticatedRequest, res, next) => {
  try {
    const input = createAuthorSchema.parse(req.body);
    const existing = await userRepository.findByEmail(input.email);
    if (existing) throw AppError.conflict("Un compte existe déjà avec cet email");

    const tempPassword = crypto.randomBytes(9).toString("base64url"); // ex: "K3f9-aB2xQpZ1"
    const passwordHash = await bcrypt.hash(tempPassword, 12);
    const author = await adminRepository.createAuthorAccount({
      name: input.name,
      email: input.email,
      passwordHash,
      phone: input.phone,
      country: input.country,
    });

    await auditLog(req.user!.id, "admin.author.create", "User", author.id);
    res.status(201).json({ user: sanitizeUser(author), tempPassword });
  } catch (err) {
    next(err);
  }
});

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

adminRouter.get("/transactions", async (req: AuthenticatedRequest, res, next) => {
  try {
    const page = req.query.page ? Number(req.query.page) : 1;
    const pageSize = Math.min(req.query.pageSize ? Number(req.query.pageSize) : 20, 100);
    const [transactions, total] = await adminRepository.listTransactions({ page, pageSize });
    res.json({ transactions, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/editorial-requests", async (_req: AuthenticatedRequest, res, next) => {
  try {
    const requests = await adminRepository.listPendingEditorialRequests();
    res.json({ requests });
  } catch (err) {
    next(err);
  }
});

adminRouter.patch("/editorial-requests/:id", async (req: AuthenticatedRequest, res, next) => {
  try {
    const { status, reviewNote } = z
      .object({ status: z.enum(["APPROVED", "REJECTED"]), reviewNote: z.string().max(2000).optional() })
      .parse(req.body);
    const request = await adminRepository.reviewEditorialRequest(req.params.id, req.user!.id, status, reviewNote);
    await auditLog(req.user!.id, "admin.editorial_request.review", "EditorialRequest", req.params.id, { status });
    res.json({ request });
  } catch (err) {
    next(err);
  }
});
