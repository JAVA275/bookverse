import { bookRepository, BookListFilters } from "../repositories/book.repository";
import { chapterRepository } from "../repositories/chapter.repository";
import { AppError } from "../utils/AppError";
import { auditLog } from "./audit.service";
import { getBookAccess } from "./bookAccess.service";

// Champs qu'un auteur/éditeur propriétaire peut modifier lui-même sur son livre.
const AUTHOR_EDITABLE_FIELDS = [
  "title",
  "subtitle",
  "description",
  "coverUrl",
  "priceEbookFcfa",
  "pricePhysicalFcfa",
  "priceAudioFcfa",
  "isbn",
  "language",
  "pages",
  "categoryId",
] as const;

// Champs réservés à la modération (ADMIN/SUPER_ADMIN/MODERATOR) : publication, mise en avant,
// statistiques de ventes, changement d'auteur... Un auteur ne doit JAMAIS pouvoir se les
// attribuer lui-même via PATCH /books/:id (c'était le cas avant : mass assignment /
// contournement de la file de modération).
const PRIVILEGED_ONLY_FIELDS = ["isPublished", "publishDate", "featured", "bestseller", "salesCount", "authorId"];

function pickAllowedFields(data: any, isPrivileged: boolean): Record<string, unknown> {
  const forbiddenKeysSubmitted = Object.keys(data ?? {}).filter(
    (key) => PRIVILEGED_ONLY_FIELDS.includes(key) && !isPrivileged
  );
  if (forbiddenKeysSubmitted.length > 0) {
    throw AppError.forbidden(
      `Champs réservés à la modération: ${forbiddenKeysSubmitted.join(", ")}`
    );
  }
  const allowedKeys = isPrivileged ? [...AUTHOR_EDITABLE_FIELDS, ...PRIVILEGED_ONLY_FIELDS] : AUTHOR_EDITABLE_FIELDS;
  const result: Record<string, unknown> = {};
  for (const key of allowedKeys) {
    if (data && Object.prototype.hasOwnProperty.call(data, key)) {
      if (key === "categoryId") {
        result.category = { connect: { id: data.categoryId } };
      } else {
        result[key] = data[key];
      }
    }
  }
  return result;
}

export const bookService = {
  list(filters: BookListFilters) {
    return bookRepository.list(filters);
  },

  // SÉCURITÉ: un livre non publié (brouillon en cours de modération) ne doit être visible
  // que par son auteur ou par un rôle privilégié — sinon n'importe quel utilisateur pouvait
  // consulter le contenu de brouillons d'autres auteurs en devinant/récupérant leur UUID.
  async getById(id: string, requesterId?: string, requesterRole?: string) {
    const book = await bookRepository.findById(id);
    if (!book) throw AppError.notFound("Livre introuvable");
    if (!book.isPublished) {
      const isOwner = requesterId && book.authorId === requesterId;
      const isPrivileged = !!requesterRole && ["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(requesterRole);
      if (!isOwner && !isPrivileged) throw AppError.notFound("Livre introuvable");
    }
    const access = await getBookAccess(book, requesterId, requesterRole);
    return { book, access };
  },

  async download(id: string, requesterId: string | undefined, requesterRole: string | undefined) {
    const book = await bookRepository.findById(id);
    if (!book || !book.isPublished) throw AppError.notFound("Livre introuvable");

    const access = await getBookAccess(book, requesterId, requesterRole);
    if (!access.hasFullAccess) {
      throw AppError.forbidden(
        "Ce livre nécessite un achat ou un abonnement Premium pour être téléchargé."
      );
    }

    await bookRepository.update(id, { downloadsCount: { increment: 1 } as any });
    return { book, access };
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

    const safeData = pickAllowedFields(data, isPrivileged);
    const updated = await bookRepository.update(bookId, safeData as any);
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

  // Ajoute un chapitre à un livre. Sans cette méthode, un livre créé via POST /books n'a
  // aucun contenu lisible (Chapter est un modèle séparé, jamais rempli à la création du
  // livre) — un auteur ne pouvait donc jamais réellement publier un livre avec du texte.
  async addChapter(
    bookId: string,
    requesterId: string,
    requesterRole: string,
    data: { title: string; content?: string; durationSeconds?: number; audioUrl?: string }
  ) {
    const book = await bookRepository.findById(bookId);
    if (!book) throw AppError.notFound("Livre introuvable");

    const isOwner = book.authorId === requesterId;
    const isPrivileged = ["ADMIN", "SUPER_ADMIN", "MODERATOR"].includes(requesterRole);
    if (!isOwner && !isPrivileged) throw AppError.forbidden("Vous ne pouvez modifier que vos propres livres");

    const existingCount = await chapterRepository.countForBook(bookId);
    const chapter = await chapterRepository.create({
      bookId,
      number: existingCount + 1,
      title: data.title,
      content: data.content,
      durationSeconds: data.durationSeconds,
      audioUrl: data.audioUrl,
    });
    await auditLog(requesterId, "book.chapter.create", "Book", bookId);
    return chapter;
  },
};
