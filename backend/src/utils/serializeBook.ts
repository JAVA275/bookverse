// Le frontend (src/types.ts) attend des champs comme `priceEbook`, `authorName`,
// `reviewsCount`, `audioDuration`, `sampleText`... qui ne correspondent pas 1:1
// aux noms des colonnes Prisma (priceEbookFcfa, author.name, etc.). Ce sérialiseur
// fait le pont pour ne pas casser les composants existants (StoreFront, BookDetailModal...).

export function serializeBook(book: any, access?: { hasFullAccess: boolean; reason: string }) {
  const avgRating =
    book.reviews?.length > 0
      ? book.reviews.reduce((s: number, r: any) => s + r.rating, 0) / book.reviews.length
      : 0;

  // Par défaut (ex: résultats de liste, qui n'incluent déjà pas les chapitres), on considère
  // l'accès complet pour ne rien casser ; c'est getById/download qui passent explicitement
  // le résultat de bookAccess.service quand des chapitres avec contenu sont inclus.
  const hasFullAccess = access?.hasFullAccess ?? true;

  return {
    id: book.id,
    title: book.title,
    subtitle: book.subtitle ?? undefined,
    authorId: book.authorId,
    authorName: book.author?.name ?? "",
    publisher: book.publisher ?? "BookVerse",
    category: book.category?.name ?? "",
    description: book.description,
    coverUrl: book.coverUrl ?? "",
    priceEbook: book.priceEbookFcfa,
    pricePhysical: book.pricePhysicalFcfa,
    priceAudio: book.priceAudioFcfa,
    isFreeWithSubscription: book.isFreeWithSubscription,
    rating: Number(avgRating.toFixed(1)),
    reviewsCount: book.reviews?.length ?? 0,
    pages: book.pages,
    audioDuration: book.chapters?.some((c: any) => c.durationSeconds)
      ? formatDuration(book.chapters.reduce((s: number, c: any) => s + (c.durationSeconds ?? 0), 0))
      : "",
    sampleText: book.chapters?.[0]?.content?.slice(0, 500) ?? "",
    // Accès verrouillé: on ne renvoie ni le texte complet ni l'audio, seulement la structure
    // (titres/numéros de chapitre) pour que le frontend puisse afficher un sommaire + un
    // écran "Abonnez-vous / Achetez pour continuer la lecture".
    hasFullAccess,
    accessReason: access?.reason,
    chapters: (book.chapters ?? []).map((c: any) => ({
      id: c.id,
      number: c.number,
      title: c.title,
      content: hasFullAccess ? c.content ?? "" : "",
      durationSeconds: c.durationSeconds ?? undefined,
      audioUrl: hasFullAccess ? c.audioUrl ?? undefined : undefined,
    })),
    publishDate: book.publishDate?.toISOString?.() ?? book.publishDate ?? "",
    isbn: book.isbn ?? "",
    language: book.language,
    stockPhysical: book.stockPhysical,
    downloadsCount: book.downloadsCount,
    salesCount: book.salesCount,
    featured: book.featured,
    bestseller: book.bestseller,
    isNewRelease: book.isNewRelease,
  };
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
}
