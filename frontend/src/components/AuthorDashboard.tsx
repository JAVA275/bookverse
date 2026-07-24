import React, { useState } from 'react';
import {
  TrendingUp,
  BookOpen,
  DollarSign,
  Users,
  Download,
  PlusCircle,
  Eye,
  CheckCircle,
  Clock,
  BarChart3,
  X,
  Check,
  Crown
} from 'lucide-react';
import { Book, BookCategory, UserProfile } from '../types';
import { NewBookInput } from '../context/BookContext';
import { api } from '../services/api';

interface AuthorDashboardProps {
  currentUser: UserProfile;
  books: Book[];
  categories: BookCategory[];
  onPublishBook: (input: NewBookInput) => Promise<Book>;
  onOpenQuotaModal: (type: 'author_limit') => void;
}

export const AuthorDashboard: React.FC<AuthorDashboardProps> = ({
  currentUser,
  books,
  categories,
  onPublishBook,
  onOpenQuotaModal,
}) => {
  const authorBooks = books.filter((b) => b.authorId === currentUser.id);

  const totalSales = authorBooks.reduce((sum, b) => sum + b.salesCount, 0);
  const totalDownloads = authorBooks.reduce((sum, b) => sum + b.downloadsCount, 0);
  const totalEarnings = currentUser.walletBalance;

  // Publish book modal state
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState(categories[0]?.id || '');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80');
  const [priceEbook, setPriceEbook] = useState(2500);
  const [pricePhysical, setPricePhysical] = useState(6500);
  const [priceAudio, setPriceAudio] = useState(3000);
  const [sampleText, setSampleText] = useState('');
  const [publishedSuccess, setPublishedSuccess] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  const handleOpenPublishModal = () => {
    // Check Author Free Quota (3 books max)
    if (currentUser.subscriptionTier === 'free' && authorBooks.length >= 3) {
      onOpenQuotaModal('author_limit');
      return;
    }
    setPublishModalOpen(true);
  };

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || publishing) return;

    setPublishError(null);
    setPublishing(true);
    try {
      const input: NewBookInput = {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        description: description.trim() || 'Ouvrage publié sur BookVerse Africa.',
        coverUrl:
          coverUrl.trim() ||
          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
        priceEbookFcfa: Number(priceEbook) || 2000,
        pricePhysicalFcfa: Number(pricePhysical) || 5000,
        priceAudioFcfa: Number(priceAudio) || 2500,
        language: 'fr',
        pages: 0,
        categoryId: category || undefined,
      };

      const createdBook = await onPublishBook(input);

      // Le livre est créé sans contenu (Chapter est un modèle séparé) : on ajoute tout de
      // suite un premier chapitre avec l'extrait fourni, sinon le livre reste illisible.
      await api.post(`/books/${createdBook.id}/chapters`, {
        title: 'Chapitre 1 : Introduction & Prologue',
        content: sampleText.trim() || 'Chapitre d’ouverture de l’ouvrage...',
      });

      setPublishedSuccess(true);
      setTimeout(() => {
        setPublishedSuccess(false);
        setPublishModalOpen(false);
        setTitle('');
        setSubtitle('');
        setDescription('');
        setSampleText('');
      }, 1500);
    } catch (err) {
      setPublishError(
        err instanceof Error ? err.message : 'Échec de la publication du livre. Réessayez.'
      );
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Top Banner Bento Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bento-card p-6 sm:p-8">
        <div className="flex items-center space-x-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Espace Auteur
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                currentUser.subscriptionTier === 'free' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                Quota de publication: {authorBooks.length} / 3 livres gratuits
              </span>
            </div>
            <h1 className="text-2xl font-bold font-serif text-white mt-0.5">
              {currentUser.name}
            </h1>
            <p className="text-xs text-slate-400">
              {currentUser.email} • {currentUser.country}
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenPublishModal}
          className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center space-x-2 transition cursor-pointer shadow-lg shadow-emerald-500/20"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publier un Nouveau Livre</span>
        </button>
      </div>

      {/* Analytics Bento KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bento-card p-6 space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-bold uppercase text-slate-400">Revenus Cumulés</span>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-black font-mono text-white">
            {totalEarnings.toLocaleString('fr-FR')} FCFA
          </p>
          <p className="text-[10px] text-emerald-400 font-bold">+18.4% ce mois-ci</p>
        </div>

        <div className="bento-card p-6 space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold uppercase text-slate-400">Ventes d'Ouvrages</span>
            <BookOpen className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-2xl font-black font-mono text-white">
            {totalSales.toLocaleString('fr-FR')} ex.
          </p>
          <p className="text-[10px] text-amber-400 font-bold">eBooks & Livres Imprimés</p>
        </div>

        <div className="bento-card p-6 space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-bold uppercase text-slate-400">Lectures & Écoutes</span>
            <Download className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-black font-mono text-white">
            {totalDownloads.toLocaleString('fr-FR')}
          </p>
          <p className="text-[10px] text-slate-400">Inclus abonnements Premium</p>
        </div>

        <div className="bento-card p-6 space-y-2">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-bold uppercase text-slate-400">Note Moyenne</span>
            <Users className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-2xl font-black font-mono text-white">
            4.8 / 5.0
          </p>
          <p className="text-[10px] text-slate-400">Basé sur les avis certifiés</p>
        </div>
      </div>

      {/* Catalog Table Bento Card */}
      <div className="bento-card p-6 space-y-4">
        <h3 className="text-lg font-bold font-serif text-white">
          Catalogue de mes Ouvrages ({authorBooks.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Livre</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Prix eBook</th>
                <th className="py-3 px-4">Ventes</th>
                <th className="py-3 px-4">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-200">
              {authorBooks.map((bk) => (
                <tr key={bk.id} className="hover:bg-slate-900/50 transition">
                  <td className="py-3 px-4 flex items-center space-x-3">
                    <img src={bk.coverUrl} alt={bk.title} className="w-10 h-12 rounded object-cover border border-slate-800" />
                    <div>
                      <p className="font-bold text-white">{bk.title}</p>
                      <p className="text-[10px] text-slate-400 font-mono">ISBN: {bk.isbn}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-300">{bk.category}</td>
                  <td className="py-3 px-4 font-mono font-bold text-white">
                    {bk.priceEbook.toLocaleString('fr-FR')} FCFA
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                    {bk.salesCount} ex.
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                      En Vente
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Publish Book Modal */}
      {publishModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bento-card max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold font-serif text-white">Publier un Nouvel Ouvrage</h3>
                <p className="text-xs text-slate-400">Sélectionnez la catégorie officielle créée par l'Admin</p>
              </div>
              <button
                onClick={() => setPublishModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {publishedSuccess ? (
              <div className="text-center py-8 space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold font-serif text-white">Ouvrage envoyé pour validation !</h4>
                <p className="text-xs text-slate-300">
                  Votre livre est enregistré en tant que brouillon et sera visible dans la
                  librairie dès qu'un modérateur l'aura validé.
                </p>
              </div>
            ) : (
              <form onSubmit={handlePublishSubmit} className="space-y-4">
                {publishError && (
                  <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs font-medium">
                    {publishError}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Titre du livre *</label>
                    <input
                      type="text"
                      required
                      placeholder="Titre de l'ouvrage"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Sous-titre (optionnel)</label>
                    <input
                      type="text"
                      placeholder="Sous-titre ou accroche"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Select Category created by Admin */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                    Catégorie Officielle Admin *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.description})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Résumé / Synopsis</label>
                  <textarea
                    rows={3}
                    placeholder="Présentez le résumé captivant de votre livre..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">URL de l'image de couverture</label>
                  <input
                    type="url"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Pricing Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Prix eBook (FCFA)</label>
                    <input
                      type="number"
                      value={priceEbook}
                      onChange={(e) => setPriceEbook(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Prix Papier (FCFA)</label>
                    <input
                      type="number"
                      value={pricePhysical}
                      onChange={(e) => setPricePhysical(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Prix Audio (FCFA)</label>
                    <input
                      type="number"
                      value={priceAudio}
                      onChange={(e) => setPriceAudio(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Texte d'extrait (Chapitre 1)</label>
                  <textarea
                    rows={3}
                    placeholder="Entrez le premier chapitre que les lecteurs pourront lire gratuitement..."
                    value={sampleText}
                    onChange={(e) => setSampleText(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setPublishModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-bold text-xs cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={publishing}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {publishing ? 'Publication...' : 'Publier le Livre'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
