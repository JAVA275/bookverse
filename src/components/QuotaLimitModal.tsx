import React from 'react';
import { Crown, AlertTriangle, Sparkles, BookOpen, PenTool, X, ArrowRight } from 'lucide-react';

interface QuotaLimitModalProps {
  type: 'reader_weekly' | 'reader_total' | 'author_limit';
  onClose: () => void;
  onGoToSubscriptions: () => void;
  currentCount?: number;
  maxCount?: number;
}

export const QuotaLimitModal: React.FC<QuotaLimitModalProps> = ({
  type,
  onClose,
  onGoToSubscriptions,
  currentCount,
  maxCount,
}) => {
  const isAuthor = type === 'author_limit';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bento-card max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-amber-500/40 text-center relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon Header */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg">
          {isAuthor ? <PenTool className="w-8 h-8" /> : <Crown className="w-8 h-8" />}
        </div>

        {/* Content */}
        <div className="space-y-3">
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-[11px] uppercase tracking-wider border border-amber-500/30">
            {isAuthor ? 'Quota d’Édition Atteint' : 'Limite de Lecteur Gratuit Atteinte'}
          </span>

          <h3 className="text-2xl font-bold font-serif text-white">
            {isAuthor
              ? 'Vous avez atteint la limite de 3 livres gratuits !'
              : type === 'reader_weekly'
              ? 'Limite de 2 livres cette semaine atteinte !'
              : 'Limite totale de 6 livres gratuits atteinte !'}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            {isAuthor ? (
              <>
                Les comptes Auteurs créés disposent d'un quota de <strong className="text-amber-400">3 publications gratuites</strong>.
                Pour auto-éditer et diffuser votre 4ème livre (et les suivants), souscrivez à l'abonnement partenaire !
              </>
            ) : (
              <>
                Sur le compte Lecteur Gratuit, l'accès est limité à <strong className="text-amber-400">2 livres par semaine</strong> et{' '}
                <strong className="text-amber-400">6 livres au total</strong>.
                Passez à l'Abonnement Lecteur Illimité pour lire sans aucune restriction !
              </>
            )}
          </p>
        </div>

        {/* Highlighted Pricing Card */}
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 uppercase">Abonnement Recommandé</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-black text-[10px]">
              Accès Illimité
            </span>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black font-mono text-white">50 000 FCFA</span>
            <span className="text-xs text-slate-400">/ an (ou 5 000 FCFA / mois)</span>
          </div>

          <ul className="text-xs text-slate-300 space-y-1 pt-1">
            <li className="flex items-center space-x-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Accès illimité à l’ensemble des eBooks et Audiobooks</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-emerald-400 font-bold">✓</span>
              <span>Aucune limite par semaine ou par mois</span>
            </li>
          </ul>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white font-bold text-xs cursor-pointer"
          >
            Fermer pour l'instant
          </button>
          <button
            onClick={() => {
              onClose();
              onGoToSubscriptions();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Voir les Formules & S'abonner</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
