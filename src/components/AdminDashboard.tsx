import React, { useState } from 'react';
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
  Layers
} from 'lucide-react';
import { Book, BookCategory, UserProfile } from '../types';

interface AdminDashboardProps {
  currentUser: UserProfile;
  books: Book[];
  categories: BookCategory[];
  onAddCategory: (newCat: BookCategory) => void;
  onDeleteCategory: (id: string) => void;
  onAddAuthor: (author: { name: string; email: string; phone: string; country: string }) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  books,
  categories,
  onAddCategory,
  onDeleteCategory,
  onAddAuthor,
}) => {
  const [activeTab, setActiveTab] = useState<'admin_finances' | 'categories' | 'create_author' | 'editorial_publisher' | 'author_royalties'>('admin_finances');

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

  const totalPlatformBooks = books.length;
  const totalSubscribers = 14250;
  const totalPlatformRevenue = 48500000; // FCFA

  // Pending Manuscript Editorial Submission Requests
  const [editorialRequests, setEditorialRequests] = useState([
    {
      id: 'req_01',
      authorName: 'Dr. Mariam Ba Diallo',
      bookTitle: 'Entreprendre en Afrique : Le Guide Disruptif',
      serviceRequested: 'Attribution ISBN & Dépôt Légal',
      status: 'en_attente',
      date: '2026-02-12',
      amount: 20000,
    },
    {
      id: 'req_02',
      authorName: 'Aïcha Diop',
      bookTitle: 'Les Légendes d’Afrique : Contes du Soir',
      serviceRequested: 'Mise en page & Maquette Intérieure',
      status: 'en_cours',
      date: '2026-02-10',
      amount: 35000,
    },
    {
      id: 'req_03',
      authorName: 'Ousmane Traoré',
      bookTitle: 'L’Énigme de Timbuktu',
      serviceRequested: 'Correction & Relecture Professionnelle',
      status: 'en_attente',
      date: '2026-02-09',
      amount: 45000,
    },
  ]);

  const transactions = [
    {
      id: 'tx_101',
      user: 'Fatou Sow',
      amount: 5000,
      method: 'Orange Money Senegal',
      type: 'Abonnement Lecteur Illimité',
      date: '2026-02-12 10:14',
      status: 'succes',
    },
    {
      id: 'tx_102',
      user: 'Koffi Mensah',
      amount: 50000,
      method: 'MTN MoMo Côte d’Ivoire',
      type: 'Abonnement Annuel (50 000 FCFA)',
      date: '2026-02-12 09:45',
      status: 'succes',
    },
    {
      id: 'tx_103',
      user: 'Amadou Koné',
      amount: 145000,
      method: 'Visa / Mastercard',
      type: 'Impression POD (200 ex.)',
      date: '2026-02-11 16:20',
      status: 'succes',
    },
  ];

  const handleCreateCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    onAddCategory({
      id: `cat_${Date.now()}`,
      name: catName.trim(),
      description: catDescription.trim() || 'Catégorie officielle créée par l’Admin.',
      bookCount: 0,
    });

    setCatName('');
    setCatDescription('');
    setCatSuccess(true);
    setTimeout(() => setCatSuccess(false), 2500);
  };

  const handleCreateAuthorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !authorEmail.trim()) return;

    onAddAuthor({
      name: authorName.trim(),
      email: authorEmail.trim(),
      phone: authorPhone.trim() || '+221 77 000 00 00',
      country: authorCountry.trim() || 'Sénégal',
    });

    setAuthorName('');
    setAuthorEmail('');
    setAuthorPhone('');
    setAuthorSuccess(true);
    setTimeout(() => setAuthorSuccess(false), 3000);
  };

  const handleApproveRequest = (id: string) => {
    setEditorialRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: 'valide' } : req))
    );
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
                18 en cours
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
                      <td className="py-3 px-4 font-bold text-white">{tx.user}</td>
                      <td className="py-3 px-4 text-slate-300">{tx.type}</td>
                      <td className="py-3 px-4 font-medium text-amber-400">{tx.method}</td>
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {tx.amount.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono">{tx.date}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center space-x-1 w-fit">
                          <CheckCircle className="w-3 h-3" />
                          <span>Validé</span>
                        </span>
                      </td>
                    </tr>
                  ))}
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
                      onClick={() => onDeleteCategory(cat.id)}
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
            <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="font-bold text-white">Compte Auteur créé avec succès !</p>
                <p className="text-[11px] font-normal text-emerald-300">L'auteur peut désormais publier jusqu'à 3 livres gratuitement.</p>
              </div>
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
                      <td className="py-3 px-4 font-bold text-white">{req.authorName}</td>
                      <td className="py-3 px-4 text-slate-300 font-serif italic">{req.bookTitle}</td>
                      <td className="py-3 px-4 text-indigo-300 font-medium">{req.serviceRequested}</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        {req.amount.toLocaleString('fr-FR')} FCFA
                      </td>
                      <td className="py-3 px-4">
                        {req.status === 'valide' ? (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                            Validé
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold border border-rose-500/30">
                            En attente
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {req.status !== 'valide' && (
                          <button
                            onClick={() => handleApproveRequest(req.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[11px] transition cursor-pointer"
                          >
                            Approuver
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
