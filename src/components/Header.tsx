import React from 'react';
import {
  BookOpen,
  Headphones,
  ShoppingBag,
  User,
  Search,
  Sparkles,
  Shield,
  PenTool,
  Building2,
  Crown,
  Moon,
  Sun,
  Menu,
  X,
  CreditCard
} from 'lucide-react';
import { UserRole, UserProfile } from '../types';

interface HeaderProps {
  currentUser: UserProfile;
  onRoleChange: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onRoleChange,
  activeTab,
  setActiveTab,
  cartCount,
  onOpenCart,
  searchQuery,
  setSearchQuery,
  darkMode,
  setDarkMode,
  onOpenProfile,
  onOpenAuth,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const roleLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    reader: { label: 'Lecteur', icon: <User className="w-4 h-4" />, color: 'bg-emerald-500' },
    author: { label: 'Auteur', icon: <PenTool className="w-4 h-4" />, color: 'bg-amber-500' },
    admin: { label: 'Éditeur & Admin', icon: <Shield className="w-4 h-4" />, color: 'bg-rose-500' },
    publisher: { label: 'Éditeur & Admin', icon: <Building2 className="w-4 h-4" />, color: 'bg-indigo-500' },
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 transition-colors">
      {/* Top Banner for Subscription status */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950 text-slate-200 text-xs py-1.5 px-4 text-center font-medium flex items-center justify-between border-b border-slate-800/60">
        <div className="hidden sm:flex items-center space-x-2 mx-auto">
          <Crown className="w-3.5 h-3.5 text-amber-400" />
          <span>
            Bienvenue sur <strong className="text-white">BookVerse</strong> – La plateforme littéraire & édition
          </span>
          <span className="opacity-40">|</span>
          <span>Abonnement actif : <strong className="uppercase text-emerald-400">{currentUser.subscriptionTier.replace('_', ' ')}</strong></span>
        </div>
        <button
          onClick={() => setActiveTab('subscriptions')}
          className="ml-auto text-emerald-400 hover:text-emerald-300 underline font-semibold cursor-pointer text-xs"
        >
          Gérer mon offre →
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('store')}>
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              B
            </div>
            <div>
              <span className="text-xl font-bold font-serif tracking-tight text-white">
                BookVerse
              </span>
            </div>
          </div>

          {/* Search bar */}
          <div className="hidden lg:flex flex-1 max-w-md relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un livre, un auteur, un genre ou un sujet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-900/90 text-slate-100 placeholder-slate-400 rounded-xl border border-slate-700/60 focus:border-emerald-500 focus:bg-slate-900 focus:outline-none transition-all"
            />
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden xl:flex items-center space-x-1 text-sm font-medium">
            <button
              onClick={() => setActiveTab('store')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'store'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              Librairie
            </button>

            <button
              onClick={() => setActiveTab('library')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'library'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              Ma Bibliothèque
            </button>

            <button
              onClick={() => setActiveTab('publishing')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 ${
                activeTab === 'publishing'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Auto-Édition & POD</span>
            </button>

            <button
              onClick={() => setActiveTab('community')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'community'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              Communauté
            </button>

            {/* Dashboard shortcut for non-readers */}
            {currentUser.role !== 'reader' && (
              <button
                onClick={() =>
                  setActiveTab(
                    currentUser.role === 'admin'
                      ? 'admin_dashboard'
                      : 'author_dashboard'
                  )
                }
                className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer font-semibold ${
                  activeTab.includes('dashboard')
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'text-amber-400/80 hover:bg-amber-500/10'
                }`}
              >
                Tableau de Bord
              </button>
            )}
          </nav>

          {/* Right Actions: Role Switcher, Cart, Dark Mode */}
          <div className="flex items-center space-x-3">
            {/* Role Switcher Pill */}
            <div className="relative group">
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-xs font-medium text-slate-200 cursor-pointer hover:border-slate-600 transition">
                <span className={`w-2 h-2 rounded-full ${roleLabels[currentUser.role].color}`}></span>
                <span>Rôle: {roleLabels[currentUser.role].label}</span>
              </div>
              <div className="absolute right-0 top-full mt-2 w-48 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 py-2 hidden group-hover:block z-50">
                <div className="px-3 py-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Changer de vue
                </div>
                {(['reader', 'author', 'admin'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      onRoleChange(r);
                      if (r === 'author') setActiveTab('author_dashboard');
                      else if (r === 'admin') setActiveTab('admin_dashboard');
                      else setActiveTab('store');
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center space-x-2 hover:bg-slate-800 cursor-pointer ${
                      currentUser.role === r ? 'font-bold text-emerald-400' : 'text-slate-300'
                    }`}
                  >
                    {roleLabels[r].icon}
                    <span>{roleLabels[r].label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dark Mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition"
              title="Changer le thème"
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-300" />}
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold cursor-pointer transition shadow-lg shadow-emerald-500/20"
              title="Mon Panier"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-950 animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth / Login Button */}
            <button
              onClick={onOpenAuth}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 cursor-pointer transition"
              title="Connexion ou Inscription"
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Connexion</span>
            </button>

            {/* User Avatar & Profile Trigger */}
            <div
              onClick={onOpenProfile}
              className="hidden sm:flex items-center space-x-2.5 pl-2 border-l border-slate-800 cursor-pointer group"
              title="Éditer mon profil & photo"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500 group-hover:scale-105 transition"
              />
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-white leading-none group-hover:text-emerald-400 transition">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-emerald-400 font-mono mt-0.5">
                  {currentUser.walletBalance.toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-800 bg-slate-950 px-4 pt-2 pb-4 space-y-2">
          <div className="relative my-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-900 text-slate-100 rounded-xl border border-slate-800 focus:border-emerald-500"
            />
          </div>

          <button
            onClick={() => { setActiveTab('store'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm font-medium rounded-xl text-slate-300 hover:bg-slate-900"
          >
            Librairie & Catalogue
          </button>
          <button
            onClick={() => { setActiveTab('library'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm font-medium rounded-xl text-slate-300 hover:bg-slate-900"
          >
            Ma Bibliothèque
          </button>
          <button
            onClick={() => { setActiveTab('publishing'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm font-medium rounded-xl text-slate-300 hover:bg-slate-900"
          >
            Auto-Édition & Impression (POD)
          </button>
          <button
            onClick={() => { setActiveTab('subscriptions'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm font-medium rounded-xl text-slate-300 hover:bg-slate-900"
          >
            Offres d'Abonnement
          </button>
          <button
            onClick={() => { setActiveTab('community'); setMobileMenuOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm font-medium rounded-xl text-slate-300 hover:bg-slate-900"
          >
            Clubs de Lecture & Avis
          </button>

          {currentUser.role !== 'reader' && (
            <button
              onClick={() => {
                setActiveTab(currentUser.role === 'admin' ? 'admin_dashboard' : 'author_dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-sm font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 rounded-xl"
            >
              Tableau de Bord ({roleLabels[currentUser.role].label})
            </button>
          )}
        </div>
      )}
    </header>
  );
};
