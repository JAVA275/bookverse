import { Response, NextFunction } from "express";
import { z } from "zod";
import { bookService } from "../services/book.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { serializeBook } from "../utils/serializeBook";

const addChapterSchema = z.object({
  title: z.string().min(1).max(300),
  content: z.string().max(200_000).optional(),
  durationSeconds: z.number().int().min(0).max(36_000).optional(),
  audioUrl: z.string().url().optional(),
});

export const bookController = {
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { search, categoryId, language, minPrice, maxPrice, featured, bestseller, sortBy, page, pageSize } =
        req.query;
      const result = await bookService.list({
        search: search as string,
        categoryId: categoryId as string,
        language: language as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        featured: featured === "true" ? true : featured === "false" ? false : undefined,
        bestseller: bestseller === "true" ? true : bestseller === "false" ? false : undefined,
        sortBy: sortBy as any,
        page: page ? Number(page) : undefined,
        pageSize: pageSize ? Number(pageSize) : undefined,
      });
      res.json({ ...result, books: result.items.map(serializeBook) });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { book, access } = await bookService.getById(req.params.id, req.user?.id, req.user?.role);
      res.json({ book: serializeBook(book, access) });
    } catch (err) {
      next(err);
    }
  },

  async download(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { book, access } = await bookService.download(req.params.id, req.user?.id, req.user?.role);
      res.json({ book: serializeBook(book, access) });
    } catch (err) {
      next(err);
    }
  },

  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const book = await bookService.create(req.user!.id, req.body);
      res.status(201).json({ book });
    } catch (err) {
      next(err);
    }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const book = await bookService.update(req.params.id, req.user!.id, req.user!.role, req.body);
      res.json({ book });
    } catch (err) {
      next(err);
    }
  },

  async publish(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const book = await bookService.publish(req.params.id, req.user!.id, req.user!.role);
      res.json({ book });
    } catch (err) {
      next(err);
    }
  },

  async addChapter(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const input = addChapterSchema.parse(req.body);
      const chapter = await bookService.addChapter(req.params.id, req.user!.id, req.user!.role, input);
      res.status(201).json({ chapter });
    } catch (err) {
      next(err);
    }
  },
};
