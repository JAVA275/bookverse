import React, { useState } from 'react';
import {
  BookOpen,
  Headphones,
  Star,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  Filter,
  ArrowRight,
  Flame,
  Award,
  Zap,
  Search,
  BookMarked,
  Heart,
  SlidersHorizontal
} from 'lucide-react';
import { Book, BookFormat, UserProfile } from '../types';
import { api } from '../services/api';

interface StoreFrontProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
  onAddToCart: (book: Book, format: BookFormat) => void;
  currentUser: UserProfile;
  searchQuery: string;
  onStartReading: (book: Book) => void;
  onStartListening: (book: Book) => void;
}

export const StoreFront: React.FC<StoreFrontProps> = ({
  books,
  onSelectBook,
  onAddToCart,
  currentUser,
  searchQuery,
  onStartReading,
  onStartListening,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [selectedFormat, setSelectedFormat] = useState<string>('Tous');
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest' | 'price_asc'>('popular');
  const [favoriteBookIds, setFavoriteBookIds] = useState<string[]>(['book_1']);
  
  // AI Recommendation State
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiRecommendations, setAiRecommendations] = useState<any[] | null>(null);

  const categories = [
    'Tous',
    'Littérature Africaine',
    'Business & Économie',
    'Histoire & Culture',
    'Jeunesse & BD',
    'Sciences & Technologie',
    'Poésie & Théâtre',
  ];

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavoriteBookIds((prev) =>
      prev.includes(id) ? prev.filter((bId) => bId !== id) : [...prev, id]
    );
  };

  const filteredBooks = books
    .filter((book) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        book.title.toLowerCase().includes(q) ||
        book.authorName.toLowerCase().includes(q) ||
        book.description.toLowerCase().includes(q) ||
        (book.isbn && book.isbn.includes(q)) ||
        (book.publisher && book.publisher.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === 'Tous' || book.category === selectedCategory;

      const matchesFormat =
        selectedFormat === 'Tous' ||
        (selectedFormat === 'eBook' && book.priceEbook > 0) ||
        (selectedFormat === 'Audio' && book.priceAudio > 0) ||
        (selectedFormat === 'Physique' && book.pricePhysical > 0);

      return matchesSearch && matchesCategory && matchesFormat;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'newest') return (b.publishDate || '').localeCompare(a.publishDate || '');
      if (sortBy === 'price_asc') return a.priceEbook - b.priceEbook;
      return (b.downloadsCount || 0) - (a.downloadsCount || 0); // popular default
    });

  const featuredBook = books.find((b) => b.featured) || books[0];

  const handleAskAIRecommendations = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setAiLoading(true);
    try {
      const data = await api.post<{ recommendations?: any[] }>('/gemini/recommendations', {
        userPreferences: aiPrompt,
        currentMood: 'Inspiré',
        favoriteGenres: [selectedCategory !== 'Tous' ? selectedCategory : 'Littérature'],
      });
      if (data.recommendations) {
        setAiRecommendations(data.recommendations);
      }
    } catch (err) {
      console.error('Error fetching AI recommendations:', err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Bento Grid Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Featured Book Hero Card (Col Span 8) */}
        <div className="lg:col-span-8 relative overflow-hidden bento-card p-8 lg:p-10 flex flex-col justify-between min-h-[380px]">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-10" />
          <img
            src={featuredBook.coverUrl}
            alt={featuredBook.title}
            className="absolute right-0 top-0 h-full w-full lg:w-2/3 object-cover opacity-30 blur-xs lg:blur-none"
          />

          <div className="relative z-20 space-y-4 max-w-xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Grand Succès Littéraire</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-serif text-white tracking-tight leading-tight">
              {featuredBook.title}
            </h1>
            <p className="text-emerald-400 font-medium text-sm sm:text-base">
              Par {featuredBook.authorName} — <span className="text-slate-400">{featuredBook.publisher}</span>
            </p>

            <p className="text-slate-300 text-xs sm:text-sm line-clamp-3 leading-relaxed">
              {featuredBook.description}
            </p>
          </div>

          <div className="relative z-20 flex flex-wrap items-center gap-3 pt-6">
            <button
              onClick={() => onSelectBook(featuredBook)}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold text-slate-950 flex items-center space-x-2 transition cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <BookOpen className="w-4 h-4" />
              <span>Découvrir l'ouvrage</span>
            </button>

            <button
              onClick={() => onStartListening(featuredBook)}
              className="px-6 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold flex items-center space-x-2 transition cursor-pointer"
            >
              <Headphones className="w-4 h-4 text-amber-400" />
              <span>Écouter l'extrait ({featuredBook.audioDuration})</span>
            </button>
          </div>
        </div>

        {/* AI Recommendation Bento Card (Col Span 4) */}
        <div className="lg:col-span-4 bento-card-emerald p-6 flex flex-col justify-between space-y-4 border border-emerald-500/30">
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-serif text-white">Conseiller IA BookVerse</h2>
                <p className="text-xs text-emerald-300/80">Recommandations littéraires sur-mesure</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Décrivez votre humeur ou sujet d'intérêt pour recevoir une sélection personnalisée.
            </p>

            <form onSubmit={handleAskAIRecommendations} className="space-y-3">
              <input
                type="text"
                placeholder="Ex : Roman historique sur l'Afrique..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-emerald-400"
              />
              <button
                type="submit"
                disabled={aiLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer disabled:opacity-50 shadow-md"
              >
                {aiLoading ? (
                  <span>Analyse en cours...</span>
                ) : (
                  <>
                    <span>Suggérer des lectures</span>
                    <Zap className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {aiRecommendations && (
            <div className="pt-3 border-t border-emerald-500/30 space-y-2">
              <p className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                <span>Sélection IA :</span>
              </p>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1 text-xs">
                {aiRecommendations.map((rec, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                    <p className="font-bold text-slate-100">{rec.title}</p>
                    <p className="text-[10px] text-emerald-400">Par {rec.author}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Catalog Filters & Bento Category Bar */}
      <div className="bento-card p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-serif text-white">
              Catalogue Littéraire & Éditions
            </h2>
            <p className="text-xs text-slate-400">
              Explorez des milliers d'eBooks, livres audio et impressions physiques d'auteurs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Sorting Select */}
            <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer font-semibold"
              >
                <option value="popular" className="bg-slate-900">Plus populaires</option>
                <option value="rating" className="bg-slate-900">Mieux notés</option>
                <option value="newest" className="bg-slate-900">Nouveautés</option>
                <option value="price_asc" className="bg-slate-900">Prix croissant</option>
              </select>
            </div>

            {/* Format selection pills */}
            <div className="flex items-center space-x-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              {['Tous', 'eBook', 'Audio', 'Physique'].map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setSelectedFormat(fmt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    selectedFormat === fmt
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Category Pills horizontal scrolling */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 font-bold'
                  : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Book Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBooks.map((book) => {
          const isFav = favoriteBookIds.includes(book.id);
          return (
            <div
              key={book.id}
              className="group bento-card overflow-hidden flex flex-col justify-between hover:border-emerald-500/50 transition-all duration-300 relative"
            >
              {/* Top Badges & Favorite Heart */}
              <div className="relative">
                <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                  {book.bestseller && (
                    <span className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wide shadow-md">
                      Bestseller
                    </span>
                  )}
                  {book.isFreeWithSubscription && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold uppercase tracking-wide shadow-md">
                      Inclus Premium
                    </span>
                  )}
                </div>

                <button
                  onClick={(e) => toggleFavorite(book.id, e)}
                  className="absolute top-3 right-3 z-20 p-2 rounded-full bg-slate-950/70 backdrop-blur-md text-slate-300 hover:text-rose-500 transition cursor-pointer border border-slate-800"
                  title="Ajouter aux coups de cœur"
                >
                  <Heart className={`w-4 h-4 ${isFav ? 'text-rose-500 fill-current' : ''}`} />
                </button>

                {/* Cover Image & Quick Action Overlay */}
                <div
                  className="relative aspect-[3/4] overflow-hidden bg-slate-950 cursor-pointer"
                  onClick={() => onSelectBook(book)}
                >
                  <img
                    src={book.coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartReading(book);
                      }}
                      className="p-3 rounded-full bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition cursor-pointer shadow-xl"
                      title="Lire l'extrait"
                    >
                      <BookOpen className="w-5 h-5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartListening(book);
                      }}
                      className="p-3 rounded-full bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition cursor-pointer shadow-xl"
                      title="Écouter l'extrait audio"
                    >
                      <Headphones className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Book Info */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="text-emerald-400/90 font-medium">{book.category}</span>
                    <div className="flex items-center text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current mr-1 text-amber-400" />
                      <span>{book.rating}</span>
                      <span className="text-slate-500 text-[10px] ml-1">({book.reviewsCount})</span>
                    </div>
                  </div>

                  <h3
                    onClick={() => onSelectBook(book)}
                    className="font-serif font-bold text-base text-white line-clamp-1 group-hover:text-emerald-400 transition cursor-pointer"
                  >
                    {book.title}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium line-clamp-1">
                    Par {book.authorName}
                  </p>
                </div>

                {/* Pricing & Add to Cart */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Prix eBook</span>
                    <span className="text-base font-extrabold text-white font-mono">
                      {book.priceEbook.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>

                  <button
                    onClick={() => onAddToCart(book, 'ebook')}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-md shadow-emerald-500/20"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Acheter</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-16 bento-card p-8">
          <BookMarked className="w-12 h-12 mx-auto text-slate-500 mb-3" />
          <h3 className="text-lg font-bold text-slate-200">
            Aucun livre ne correspond à votre recherche
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Essayez de modifier vos filtres ou d'utiliser le conseiller littéraire IA.
          </p>
        </div>
      )}
    </div>
  );
};

