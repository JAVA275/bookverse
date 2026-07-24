// Le frontend (src/types.ts) attend des champs comme `priceEbook`, `authorName`,
// `reviewsCount`, `audioDuration`, `sampleText`... qui ne correspondent pas 1:1
// aux noms des colonnes Prisma (priceEbookFcfa, author.name, etc.). Ce sérialiseur
// fait le pont pour ne pas casser les composants existants (StoreFront, BookDetailModal...).

export function serializeBook(book: any) {
  const avgRating =
    book.reviews?.length > 0
      ? book.reviews.reduce((s: number, r: any) => s + r.rating, 0) / book.reviews.length
      : 0;

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
    chapters: (book.chapters ?? []).map((c: any) => ({
      id: c.id,
      number: c.number,
      title: c.title,
      content: c.content ?? "",
      durationSeconds: c.durationSeconds ?? undefined,
      audioUrl: c.audioUrl ?? undefined,
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
