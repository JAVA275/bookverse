import React from 'react';
import {
  MessageSquare,
  Users,
  Calendar,
  Sparkles,
  BookOpen,
  ArrowRight,
  Send,
  Flame
} from 'lucide-react';
import { MOCK_BOOK_CLUBS, MOCK_REVIEWS } from '../data/mockData';
import { Book, UserProfile } from '../types';

interface CommunityViewProps {
  currentUser: UserProfile;
  books: Book[];
  onSelectBook: (book: Book) => void;
}

export const CommunityView: React.FC<CommunityViewProps> = ({
  currentUser,
  books,
  onSelectBook,
}) => {
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Banner Bento Card */}
      <div className="bento-card p-8 sm:p-12 text-white space-y-4 border-indigo-500/30">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
          <Users className="w-4 h-4 text-emerald-400" />
          <span>Communauté & Rencontres Littéraires</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-serif">
          Clubs de Lecture & Salons de Discussion
        </h1>
        <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
          Échangez avec des passionnés de lecture à travers toute l'Afrique et la diaspora. Rejoignez un club de lecture ou participez aux visioconférences avec les auteurs.
        </p>
      </div>

      {/* Book Clubs Bento Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-serif text-white">
          Clubs de Lecture Officiels
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MOCK_BOOK_CLUBS.map((club) => (
            <div
              key={club.id}
              className="bento-card p-6 space-y-4 flex flex-col justify-between hover:border-emerald-500/40 transition"
            >
              <div className="flex items-start space-x-4">
                <img
                  src={club.bookCover}
                  alt={club.bookTitle}
                  className="w-20 h-28 rounded-xl object-cover ring-2 ring-emerald-500/30 shrink-0 border border-slate-800"
                />
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                    {club.membersCount} Lecteurs
                  </span>
                  <h3 className="font-serif font-bold text-lg text-white">
                    {club.title}
                  </h3>
                  <p className="text-xs text-amber-400 font-medium">
                    Lecture actuelle : {club.bookTitle}
                  </p>
                  <p className="text-xs text-slate-300 line-clamp-2 mt-1">
                    {club.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>{club.nextMeetingDate}</span>
                </div>

                <button
                  onClick={() => alert(`Vous avez rejoint le ${club.title} !`)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  Rejoindre le Club
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reviews Stream Bento Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold font-serif text-white">
          Dernières Critiques de Lecteurs
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MOCK_REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="bento-card p-6 space-y-3"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={rev.userAvatar}
                  alt={rev.userName}
                  className="w-9 h-9 rounded-full object-cover border border-slate-700"
                />
                <div>
                  <p className="font-bold text-xs text-white">{rev.userName}</p>
                  <p className="text-[10px] text-slate-400">{rev.date}</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 italic">
                "{rev.comment}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
