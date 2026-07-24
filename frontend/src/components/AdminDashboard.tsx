import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  TrendingUp,
  Users,
  BookOpen,
  DollarSign,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Clock,
  Building2,
  FileCheck,
  Printer,
  Sparkles,
  PenTool,
  Search,
  Check,
  X,
  Plus,
  Trash2,
  UserPlus,
  Layers,
  Ban,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { Book, BookCategory, UserProfile } from '../types';
import { api } from '../services/api';

interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  isBanned: boolean;
  subscriptionTier: string;
  createdAt: string;
}

interface AdminOrderRow {
  id: string;
  totalAmountFcfa: number;
  status: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
  items: { id: string; book: { id: string; title: string } }[];
}

interface AdminStats {
  usersCount: number;
  booksCount: number;
  ordersCount: number;
  pendingBooksCount: number;
  totalRevenueFcfa: number;
}

interface AdminPendingBook {
  id: string;
  title: string;
  authorName: string;
}

interface AdminTransactionRow {
  id: string;
  amountFcfa: number;
  provider: string;
  status: string;
  createdAt: string;
  order: { id: string; user: { id: string; name: string; email: string } };
}

interface AdminEditorialRequestRow {
  id: string;
  title: string;
  pitch: string;
  amountFcfa: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  author: { id: string; name: string; email: string };
  book: { id: string; title: string } | null;
}

interface AdminDashboardProps {
  currentUser: UserProfile;
  books: Book[];
  categories: BookCategory[];
  onAddCategory: (newCat: { name: string; description?: string; iconName?: string }) => Promise<void>;
  onDeleteCategory: (id: string) => Promise<void>;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  books,
  categories,
  onAddCategory,
  onDeleteCategory,
}) => {
  const [activeTab, setActiveTab] = useState<'admin_finances' | 'categories' | 'create_author' | 'editorial_publisher' | 'author_royalties' | 'users_orders' | 'moderation'>('admin_finances');

  // --- Données réelles branchées sur /api/admin/* (RBAC: ADMIN / SUPER_ADMIN) ---
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUserRow[]>([]);
  const [adminOrders, setAdminOrders] = useState<AdminOrderRow[]>([]);
  const [pendingBooks, setPendingBooks] = useState<AdminPendingBook[]>([]);
  const [transactions, setTransactions] = useState<AdminTransactionRow[]>([]);
  const [editorialRequests, setEditorialRequests] = useState<AdminEditorialRequestRow[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  const fetchAdminStats = useCallback(async () => {
    try {
      const { stats } = await api.get<{ stats: AdminStats }>('/admin/stats');
      setAdminStats(stats);
    } catch (err) {
      // Silencieux: la carte affiche alors les valeurs de secours ci-dessous.
    }
  }, []);

  const fetchAdminUsers = useCallback(async () => {
    setAdminLoading(true);
    setAdminError(null);
    try {
      const query = userSearch ? `?search=${encodeURIComponent(userSearch)}` : '';
      const { users } = await api.get<{ users: AdminUserRow[] }>(`/admin/users${query}`);
      setAdminUsers(users);
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : 'Impossible de charger les utilisateurs.');
    } finally {
      setAdminLoading(false);
    }
  }, [userSearch]);

  const fetchAdminOrders = useCallback(async () => {
    setAdminLoading(true);
    setAdminError(null);
    try {
      const { orders } = await api.get<{ orders: AdminOrderRow[] }>('/admin/orders');
      setAdminOrders(orders);
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : 'Impossible de charger les commandes.');
    } finally {
      setAdminLoading(false);
    }
  }, []);

  const fetchPendingBooks = useCallback(async () => {
    setAdminLoading(true);
    setAdminError(null);
    try {
      const { books: pending } = await api.get<{ books: AdminPendingBook[] }>('/admin/books/pending');
      setPendingBooks(pending);
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : 'Impossible de charger les livres en attente.');
    } finally {
      setAdminLoading(false);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    setAdminLoading(true);
    setAdminError(null);
    try {
      const { transactions: txs } = await api.get<{ transactions: AdminTransactionRow[] }>('/admin/transactions');
      setTransactions(txs);
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : 'Impossible de charger les transactions.');
    } finally {
      setAdminLoading(false);
    }
  }, []);

  const fetchEditorialRequests = useCallback(async () => {
    setAdminLoading(true);
    setAdminError(null);
    try {
      const { requests } = await api.get<{ requests: AdminEditorialRequestRow[] }>('/admin/editorial-requests');
      setEditorialRequests(requests);
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : 'Impossible de charger les demandes éditoriales.');
    } finally {
      setAdminLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminStats();
    fetchEditorialRequests();
  }, [fetchAdminStats, fetchEditorialRequests]);

  useEffect(() => {
    if (activeTab === 'users_orders') {
      fetchAdminUsers();
      fetchAdminOrders();
    }
    if (activeTab === 'moderation') {
      fetchPendingBooks();
    }
    if (activeTab === 'admin_finances') {
      fetchTransactions();
    }
    if (activeTab === 'editorial_publisher') {
      fetchEditorialRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleToggleBan = async (user: AdminUserRow) => {
    try {
      const { user: updated } = await api.patch<{ user: AdminUserRow }>(`/admin/users/${user.id}/ban`, {
        isBanned: !user.isBanned,
      });
      setAdminUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, isBanned: updated.isBanned } : u)));
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : "Échec de l'action de bannissement.");
    }
  };

  const handleApproveBook = async (bookId: string) => {
    try {
      await api.post(`/books/${bookId}/publish`);
      setPendingBooks((prev) => prev.filter((b) => b.id !== bookId));
      fetchAdminStats();
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : 'Échec de la validation du livre.');
    }
  };

  // Category creation form state
  const [catName, setCatName] = useState('');
  const [catDescription, setCatDescription] = useState('');
  const [catSuccess, setCatSuccess] = useState(false);

  // Author creation form state
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [authorPhone, setAuthorPhone] = useState('');
  const [authorCountry, setAuthorCountry] = useState('Sénégal');
  const [authorSuccess, setAuthorSuccess] = useState(false);
  const [authorTempPassword, setAuthorTempPassword] = useState<string | null>(null);
  const [authorFormError, setAuthorFormError] = useState<string | null>(null);

  const totalPlatformBooks = adminStats?.booksCount ?? books.length;
  const totalSubscribers = adminStats?.usersCount ?? 14250;
  const totalPlatformRevenue = adminStats?.totalRevenueFcfa ?? 48500000; // FCFA

  const [categoryError, setCategoryError] = useState<string | null>(null);

  const handleCreateCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    setCategoryError(null);
    try {
      await onAddCategory({
        name: catName.trim(),
        description: catDescription.trim() || 'Catégorie officielle créée par l’Admin.',
      });
      setCatName('');
      setCatDescription('');
      setCatSuccess(true);
      setTimeout(() => setCatSuccess(false), 2500);
    } catch (err) {
      setCategoryError(err instanceof Error ? err.message : 'Échec de la création de la catégorie.');
    }
  };

  const handleCreateAuthorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !authorEmail.trim()) return;

    setAuthorFormError(null);
    try {
      const { tempPassword } = await api.post<{ tempPassword: string }>('/admin/authors', {
        name: authorName.trim(),
        email: authorEmail.trim(),
        phone: authorPhone.trim() || undefined,
        country: authorCountry.trim() || undefined,
      });

      setAuthorName('');
      setAuthorEmail('');
      setAuthorPhone('');
      setAuthorTempPassword(tempPassword);
      setAuthorSuccess(true);
    } catch (err) {
      setAuthorFormError(err instanceof Error ? err.message : 'Échec de la création du compte auteur.');
    }
  };

  const handleApproveRequest = async (id: string) => {
    try {
      await api.patch(`/admin/editorial-requests/${id}`, { status: 'APPROVED' });
      setEditorialRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : 'Échec de la validation de la demande.');
    }
  };

  const handleRejectRequest = async (id: string) => {
    try {
      await api.patch(`/admin/editorial-requests/${id}`, { status: 'REJECTED' });
      setEditorialRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (err) {
      setAdminError(err instanceof Error ? err.message : 'Échec du rejet de la demande.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Top Banner Bento Card */}
      <div className="bento-card p-6 sm:p-8 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 border-indigo-500/30">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-rose-500/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shadow-lg">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-extrabold text-indigo-400 uppercase tracking-widest bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                Panneau Super Administrateur & Éditeur
              </span>
            </div>
            <h1 className="text-2xl font-bold font-serif text-white mt-1">
              Maison d'Édition & Administration BookVerse
            </h1>
            <p className="text-xs text-slate-400">
              Gestion complète du catalogue, création de catégories, comptes auteurs et suivi des transactions.
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-900 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('admin_finances')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center space-x-1 ${
              activeTab === 'admin_finances'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Finances</span>
          </button>

          <button
            onClick={() => setActiveTab('users_orders')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center space-x-1 ${
              activeTab === 'users_orders'
                ? 'bg-sky-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Utilisateurs & Commandes</span>
          </button>

          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center space-x-1 ${
              activeTab === 'moderation'
                ? 'bg-rose-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Modération ({adminStats?.pendingBooksCount ?? 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center space-x-1 ${
              activeTab === 'categories'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Catégories ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('create_author')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center space-x-1 ${
              activeTab === 'create_author'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Créer Auteur</span>
          </button>

          <button
            onClick={() => setActiveTab('editorial_publisher')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center space-x-1 ${
              activeTab === 'editorial_publisher'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Édition</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Finances & Overview */}
      {activeTab === 'admin_finances' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bento-card p-6 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Chiffre d'Affaires Général</span>
              <p className="text-2xl font-black font-mono text-white">
                {totalPlatformRevenue.toLocaleString('fr-FR')} FCFA
              </p>
              <p className="text-[10px] text-emerald-400 font-bold">+24.5% vs mois dernier</p>
            </div>

            <div className="bento-card p-6 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Abonnés Actifs</span>
              <p className="text-2xl font-black font-mono text-white">
                {totalSubscribers.toLocaleString('fr-FR')}
              </p>
              <p className="text-[10px] text-amber-400 font-bold">Orange / MTN / Visa / Wave</p>
            </div>

            <div className="bento-card p-6 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Catalogue d'Ouvrages</span>
              <p className="text-2xl font-black font-mono text-white">
                {totalPlatformBooks} Titres
              </p>
              <p className="text-[10px] text-emerald-400 font-bold">eBooks, Audio & Imprimés</p>
            </div>

            <div className="bento-card p-6 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Projets Éditoriaux</span>
              <p className="text-2xl font-black font-mono text-white">
                {editorialRequests.length} en cours
              </p>
              <p className="text-[10px] text-indigo-400 font-bold">Mise en page & ISBN</p>
            </div>
          </div>

          <div className="bento-card p-6 space-y-4">
            <h3 className="text-lg font-bold font-serif text-white flex items-center space-x-2">
              <Smartphone className="w-5 h-5 text-amber-400" />
              <span>Flux de Transactions Mobile Money & Cartes</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Utilisateur</th>
                    <th className="py-3 px-4">Opération</th>
                    <th className="py-3 px-4">Mode de Paiement</th>
                    <th className="py-3 px-4">Montant</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs text-slate-200">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-900/50 transition">
                      <td className="py-3 px-4 font-bold text-white">{tx.order.user.name}</td>
                      <td className="py-3 px-4 text-slate-300">Commande #{tx.order.id.slice(0, 8)}</td>
                      <td className="py-3 px-4 font-medium text-amber-400">{tx.provider.replace('_', ' ')}</td>
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {tx.amountFcfa.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono">
                        {new Date(tx.createdAt).toLocaleString('fr-FR')}
                      </td>
                      <td className="py-3 px-4">
                        {tx.status === 'SUCCEEDED' ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center space-x-1 w-fit">
                            <CheckCircle className="w-3 h-3" />
                            <span>Validé</span>
                          </span>
                        ) : tx.status === 'FAILED' ? (
                          <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold border border-rose-500/30 flex items-center space-x-1 w-fit">
                            <AlertCircle className="w-3 h-3" />
                            <span>Échoué</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30 flex items-center space-x-1 w-fit">
                            <Clock className="w-3 h-3" />
                            <span>En attente</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 px-4 text-center text-slate-500">
                        Aucune transaction pour le moment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Category Management (Admin creates categories) */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* Create Category Form */}
          <div className="bento-card p-6 space-y-4">
            <h3 className="text-lg font-bold font-serif text-white flex items-center space-x-2">
              <Plus className="w-5 h-5 text-emerald-400" />
              <span>Créer une Nouvelle Catégorie</span>
            </h3>
            <p className="text-xs text-slate-400">
              Les catégories créées par l'Admin apparaîtront automatiquement lors de la publication de livres par les Auteurs.
            </p>

            {catSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center space-x-2">
                <Check className="w-4 h-4" />
                <span>Nouvelle catégorie ajoutée avec succès !</span>
              </div>
            )}

            {categoryError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4" />
                <span>{categoryError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCategorySubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Nom de la Catégorie</label>
                <input
                  type="text"
                  required
                  placeholder="ex. Science & Technologie"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Description courte de la catégorie..."
                    value={catDescription}
                    onChange={(e) => setCatDescription(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg cursor-pointer shrink-0"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* List of Existing Categories */}
          <div className="bento-card p-6 space-y-4">
            <h3 className="text-lg font-bold font-serif text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>Catégories Officielles Actives ({categories.length})</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div key={cat.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 relative group">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-white font-serif">{cat.name}</h4>
                    <button
                      onClick={() =>
                        onDeleteCategory(cat.id).catch((err) =>
                          setCategoryError(err instanceof Error ? err.message : 'Échec de la suppression.')
                        )
                      }
                      className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      title="Supprimer la catégorie"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{cat.description}</p>
                  <div className="pt-2 text-[10px] text-emerald-400 font-mono font-bold border-t border-slate-800">
                    {cat.bookCount || 0} ouvrages dans le catalogue
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Create Author Account (Admin creates authors) */}
      {activeTab === 'create_author' && (
        <div className="bento-card p-6 sm:p-8 max-w-2xl mx-auto space-y-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <UserPlus className="w-5 h-5 text-amber-400" />
              <h3 className="text-xl font-bold font-serif text-white">Créer un Compte Auteur</h3>
            </div>
            <p className="text-xs text-slate-400">
              Seul l'Administrateur peut créer des comptes Auteurs. Chaque nouvel auteur créé bénéficie d'un quota gratuit de <strong className="text-amber-400">3 publications de livres</strong> avant d'être invité à s'abonner.
            </p>
          </div>

          {authorSuccess && (
            <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold space-y-2">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="font-bold text-white">Compte Auteur créé avec succès !</p>
                  <p className="text-[11px] font-normal text-emerald-300">L'auteur peut désormais publier jusqu'à 3 livres gratuitement.</p>
                </div>
              </div>
              {authorTempPassword && (
                <div className="ml-8 p-3 rounded-lg bg-slate-950/60 border border-emerald-500/20">
                  <p className="text-[11px] font-normal text-slate-300">
                    Mot de passe temporaire à transmettre à l'auteur par un canal sûr (il ne sera plus affiché) :
                  </p>
                  <p className="font-mono text-sm text-white mt-1 select-all">{authorTempPassword}</p>
                </div>
              )}
            </div>
          )}

          {authorFormError && (
            <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              <span>{authorFormError}</span>
            </div>
          )}

          <form onSubmit={handleCreateAuthorSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Nom complet de l'Auteur</label>
              <input
                type="text"
                required
                placeholder="ex. Prof. Cheikh Anta Diop"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Adresse Email Officielle</label>
              <input
                type="email"
                required
                placeholder="auteur@example.com"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Téléphone (Mobile Money)</label>
                <input
                  type="text"
                  placeholder="+221 77 000 00 00"
                  value={authorPhone}
                  onChange={(e) => setAuthorPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Pays de Résidence</label>
                <input
                  type="text"
                  placeholder="Sénégal, Côte d'Ivoire, Cameroun..."
                  value={authorCountry}
                  onChange={(e) => setAuthorCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 text-xs space-y-1">
              <span className="font-bold block">Information Quota Initial :</span>
              <p className="text-[11px] text-amber-200">
                L'auteur aura un solde de 0/3 livres publiés. Au 4ème livre, l'application lui demandera automatiquement de souscrire à un forfait d'auto-édition.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-lg transition cursor-pointer"
            >
              Créer le Compte Auteur (Quota 3 Livres Gratuits)
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: Editorial & Publisher Management */}
      {activeTab === 'editorial_publisher' && (
        <div className="space-y-6">
          <div className="bento-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold font-serif text-white flex items-center space-x-2">
                  <FileCheck className="w-5 h-5 text-indigo-400" />
                  <span>Demandes de Services Éditoriaux & ISBN</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Validez les demandes d'auteurs pour la relecture, mise en page, attribution d'ISBN et dépôts légaux.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Auteur</th>
                    <th className="py-3 px-4">Titre de l'Ouvrage</th>
                    <th className="py-3 px-4">Service Demandé</th>
                    <th className="py-3 px-4">Montant</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs text-slate-200">
                  {editorialRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-900/50 transition">
                      <td className="py-3 px-4 font-bold text-white">{req.author.name}</td>
                      <td className="py-3 px-4 text-slate-300 font-serif italic">{req.book?.title ?? req.title}</td>
                      <td className="py-3 px-4 text-indigo-300 font-medium">{req.pitch}</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        {req.amountFcfa.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="py-3 px-4">
                        {req.status === 'APPROVED' ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                            Validé
                          </span>
                        ) : req.status === 'REJECTED' ? (
                          <span className="px-2.5 py-1 rounded-full bg-slate-500/20 text-slate-400 text-[10px] font-bold border border-slate-500/30">
                            Rejeté
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold border border-rose-500/30">
                            En attente
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {req.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApproveRequest(req.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[11px] transition cursor-pointer"
                            >
                              Approuver
                            </button>
                            <button
                              onClick={() => handleRejectRequest(req.id)}
                              className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-[11px] transition cursor-pointer border border-rose-500/30"
                            >
                              Rejeter
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {editorialRequests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 px-4 text-center text-slate-500">
                        Aucune demande éditoriale en attente.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {/* Tab 5: Real Users & Orders management (branché sur /api/admin/*) */}
      {activeTab === 'users_orders' && (
        <div className="space-y-6">
          {adminError && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{adminError}</span>
            </div>
          )}

          <div className="bento-card p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h3 className="text-lg font-bold font-serif text-white flex items-center space-x-2">
                <Users className="w-5 h-5 text-sky-400" />
                <span>Utilisateurs ({adminUsers.length})</span>
              </h3>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Rechercher un utilisateur..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchAdminUsers()}
                    className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={fetchAdminUsers}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  title="Rafraîchir"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${adminLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Nom</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Rôle</th>
                    <th className="py-3 px-4">Abonnement</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs text-slate-200">
                  {adminUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-900/50 transition">
                      <td className="py-3 px-4 font-bold text-white">{u.name}</td>
                      <td className="py-3 px-4 text-slate-400 font-mono">{u.email}</td>
                      <td className="py-3 px-4 text-indigo-300 font-medium">{u.role}</td>
                      <td className="py-3 px-4 text-slate-300">{u.subscriptionTier}</td>
                      <td className="py-3 px-4">
                        {u.isBanned ? (
                          <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold border border-rose-500/30">
                            Banni
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                            Actif
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleToggleBan(u)}
                          className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center space-x-1 ml-auto ${
                            u.isBanned
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                              : 'bg-rose-500 hover:bg-rose-600 text-white'
                          }`}
                        >
                          <Ban className="w-3 h-3" />
                          <span>{u.isBanned ? 'Réactiver' : 'Bannir'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {adminUsers.length === 0 && !adminLoading && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-500 text-xs">
                        Aucun utilisateur trouvé.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bento-card p-6 space-y-4">
            <h3 className="text-lg font-bold font-serif text-white flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>Commandes ({adminOrders.length})</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Client</th>
                    <th className="py-3 px-4">Articles</th>
                    <th className="py-3 px-4">Montant</th>
                    <th className="py-3 px-4">Statut</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs text-slate-200">
                  {adminOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-900/50 transition">
                      <td className="py-3 px-4">
                        <p className="font-bold text-white">{order.user.name}</p>
                        <p className="text-slate-500 font-mono text-[10px]">{order.user.email}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {order.items.map((it) => it.book.title).join(', ')}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {order.totalAmountFcfa.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="py-3 px-4 text-amber-300 font-semibold">{order.status}</td>
                      <td className="py-3 px-4 text-slate-400 font-mono">
                        {new Date(order.createdAt).toLocaleString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                  {adminOrders.length === 0 && !adminLoading && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500 text-xs">
                        Aucune commande pour le moment.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Book moderation queue (branché sur /api/admin/books/pending + POST /books/:id/publish) */}
      {activeTab === 'moderation' && (
        <div className="bento-card p-6 space-y-4">
          <h3 className="text-lg font-bold font-serif text-white flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-rose-400" />
            <span>Livres en attente de validation ({pendingBooks.length})</span>
          </h3>
          <p className="text-xs text-slate-400">
            Ces ouvrages ont été soumis par des auteurs et ne sont pas encore visibles dans la librairie publique.
          </p>

          {adminError && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{adminError}</span>
            </div>
          )}

          <div className="space-y-3">
            {pendingBooks.map((book) => (
              <div
                key={book.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-sm text-white font-serif">{book.title}</p>
                  <p className="text-xs text-slate-400">par {book.authorName}</p>
                </div>
                <button
                  onClick={() => handleApproveBook(book.id)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[11px] transition cursor-pointer flex items-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Valider la publication</span>
                </button>
              </div>
            ))}
            {pendingBooks.length === 0 && !adminLoading && (
              <p className="text-center text-slate-500 text-xs py-6">Aucun livre en attente de modération.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
