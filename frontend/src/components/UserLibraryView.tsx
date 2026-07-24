import React, { useState } from 'react';
import {
  BookOpen,
  Headphones,
  Bookmark,
  CheckCircle,
  Clock,
  Sparkles,
  Download
} from 'lucide-react';
import { Book, UserProfile } from '../types';

interface UserLibraryViewProps {
  currentUser: UserProfile;
  books: Book[];
  onStartReading: (book: Book) => void;
  onStartListening: (book: Book) => void;
}

export const UserLibraryView: React.FC<UserLibraryViewProps> = ({
  currentUser,
  books,
  onStartReading,
  onStartListening,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'ebook' | 'audio'>('all');

  const myBooks = books.filter((b) =>
    currentUser.myLibraryBookIds.includes(b.id) || currentUser.myAudiobookIds.includes(b.id)
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Header Bento Box */}
      <div className="bento-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-serif text-white">
            Ma Bibliothèque Personnelle
          </h1>
          <p className="text-sm text-slate-400">
            Retrouvez tous vos e-Books, Livres Audio et marques-pages synchronisés.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1.5 rounded-xl self-start border border-slate-800">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterType === 'all'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tous mes Livres ({myBooks.length})
          </button>
          <button
            onClick={() => setFilterType('ebook')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterType === 'ebook'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            eBooks PDF/EPUB
          </button>
          <button
            onClick={() => setFilterType('audio')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              filterType === 'audio'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Livres Audio
          </button>
        </div>
      </div>

      {/* Grid of My Books Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {myBooks.map((bk) => {
          const bookmarkedPage = currentUser.bookmarkedPageByBookId[bk.id] || 1;

          return (
            <div
              key={bk.id}
              className="bento-card p-5 flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-300"
            >
              <div className="flex space-x-4 mb-4">
                <img
                  src={bk.coverUrl}
                  alt={bk.title}
                  className="w-24 h-32 rounded-xl object-cover shadow-lg border border-slate-800 shrink-0"
                />
                <div className="space-y-1.5 overflow-hidden">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                    {bk.category}
                  </span>
                  <h3 className="font-serif font-bold text-sm text-white line-clamp-1">
                    {bk.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {bk.authorName}
                  </p>

                  <div className="pt-2 text-[11px] text-slate-400 space-y-0.5 font-mono">
                    <p>Page {bookmarkedPage} sur {bk.pages}</p>
                    <p>Durée audio : {bk.audioDuration}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => onStartReading(bk)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Lire (P.{bookmarkedPage})</span>
                </button>

                <button
                  onClick={() => onStartListening(bk)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 font-bold text-xs flex items-center justify-center space-x-1.5 transition cursor-pointer"
                >
                  <Headphones className="w-3.5 h-3.5 text-amber-400" />
                  <span>Écouter</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
