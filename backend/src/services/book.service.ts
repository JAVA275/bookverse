import { bookRepository, BookListFilters } from "../repositories/book.repository";
import { AppError } from "../utils/AppError";
import { auditLog } from "./audit.service";

export const bookService = {
  list(filters: BookListFilters) {
    return bookRepository.list(filters);
  },

  async getById(id: string) {
    const book = await bookRepository.findById(id);
    if (!book) throw AppError.notFound("Livre introuvable");
    return book;
  },

  async create(authorId: string, data: any) {
    const book = await bookRepository.create({
      title: data.title,
      subtitle: data.subtitle,
      description: data.description,
      coverUrl: data.coverUrl,
      priceEbookFcfa: data.priceEbookFcfa ?? 0,
      pricePhysicalFcfa: data.pricePhysicalFcfa ?? 0,
      priceAudioFcfa: data.priceAudioFcfa ?? 0,
      isbn: data.isbn,
      language: data.language ?? "fr",
      pages: data.pages ?? 0,
      author: { connect: { id: authorId } },
      ...(data.categoryId ? { category: { connect: { id: data.categoryId } } } : {}),
    });
    await auditLog(authorId, "book.create", "Book", book.id);
    return book;
  },

  async update(bookId: string, requesterId: string, requesterRole: string, data: any) {
    const book = await bookRepository.findById(bookId);
    if (!book) throw AppError.notFound("Livre introuvable");

    const isOwner = book.authorId === requesterId;
    const isPrivileged = ["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(requesterRole);
    if (!isOwner && !isPrivileged) throw AppError.forbidden("Vous ne pouvez modifier que vos propres livres");

    const updated = await bookRepository.update(bookId, data);
    await auditLog(requesterId, "book.update", "Book", bookId);
    return updated;
  },

  async publish(bookId: string, requesterId: string, requesterRole: string) {
    const isPrivileged = ["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(requesterRole);
    if (!isPrivileged) throw AppError.forbidden("Seul un modérateur/admin peut valider une publication");
    const updated = await bookRepository.update(bookId, { isPublished: true, publishDate: new Date() });
    await auditLog(requesterId, "book.publish", "Book", bookId);
    return updated;
  },
};
