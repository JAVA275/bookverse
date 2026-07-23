import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { Shield, User, Lock, Mail, Phone, Globe, Check, X, Sparkles, KeyRound, UserPlus } from 'lucide-react';
import { MOCK_USERS } from '../data/mockData';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  onLoginSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('rakielsamuel9@gmail.com');
  const [loginPassword, setLoginPassword] = useState('azerty');
  const [loginError, setLoginError] = useState('');

  // Visitor Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCountry, setRegCountry] = useState('Sénégal');
  const [regSuccess, setRegSuccess] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    // Check if logging into Super Admin account specified in prompt
    if (loginEmail.trim().toLowerCase() === 'rakielsamuel9@gmail.com') {
      if (loginPassword === 'azerty') {
        onLoginSuccess(MOCK_USERS.admin);
        onClose();
        return;
      } else {
        setLoginError('Mot de passe incorrect pour le compte Super Admin.');
        return;
      }
    }

    // Check mock reader or author users
    if (loginEmail.includes('fatou') || loginEmail.includes('reader')) {
      onLoginSuccess(MOCK_USERS.reader);
      onClose();
      return;
    }

    if (loginEmail.includes('amadou') || loginEmail.includes('author')) {
      onLoginSuccess(MOCK_USERS.author);
      onClose();
      return;
    }

    // Default fallback user login
    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      name: loginEmail.split('@')[0] || 'Utilisateur BookVerse',
      email: loginEmail,
      role: 'reader',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      subscriptionTier: 'free',
      walletBalance: 0,
      phone: '+221 77 000 00 00',
      country: 'Sénégal',
      myLibraryBookIds: [],
      myAudiobookIds: [],
      bookmarkedPageByBookId: {},
      weeklyReadsCount: 0,
      totalReadsCount: 0,
    };
    onLoginSuccess(newUser);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      name: regName || 'Nouveau Lecteur',
      email: regEmail,
      role: 'reader',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      subscriptionTier: 'free',
      walletBalance: 0,
      phone: regPhone || '+221 77 000 00 00',
      country: regCountry || 'Sénégal',
      myLibraryBookIds: [],
      myAudiobookIds: [],
      bookmarkedPageByBookId: {},
      weeklyReadsCount: 0,
      totalReadsCount: 0,
    };

    setRegSuccess(true);
    setTimeout(() => {
      onLoginSuccess(newUser);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bento-card max-w-md w-full p-6 space-y-6 shadow-2xl relative">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 font-bold flex items-center justify-center text-sm">
              B
            </div>
            <h3 className="text-lg font-bold font-serif text-white">BookVerse Africa</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => { setMode('login'); setLoginError(''); }}
            className={`py-2 rounded-lg transition cursor-pointer flex items-center justify-center space-x-1.5 ${
              mode === 'login' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Connexion</span>
          </button>
          <button
            onClick={() => setMode('register')}
            className={`py-2 rounded-lg transition cursor-pointer flex items-center justify-center space-x-1.5 ${
              mode === 'register' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Créer un Compte</span>
          </button>
        </div>

        {/* Form: Login */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-300 flex items-start space-x-2">
              <Shield className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-white">Compte Super Admin prédéfini :</strong>
                <span>Email: <code className="text-amber-300 font-mono">rakielsamuel9@gmail.com</code> | Pass: <code className="text-amber-300 font-mono">azerty</code></span>
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                {loginError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Adresse Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="exemple@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Mot de passe</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg transition cursor-pointer"
            >
              Se Connecter
            </button>

            {/* Quick Demo Login Preset Buttons */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block text-center">
                Accès Rapide Démo
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => { onLoginSuccess(MOCK_USERS.reader); onClose(); }}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition text-center cursor-pointer font-medium"
                >
                  Lecteur (Fatou)
                </button>
                <button
                  type="button"
                  onClick={() => { onLoginSuccess(MOCK_USERS.author); onClose(); }}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition text-center cursor-pointer font-medium"
                >
                  Auteur (Amadou)
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Form: Register (Visiteur) */}
        {mode === 'register' && (
          <div>
            {regSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold font-serif text-white">Compte Lecteur Créé !</h4>
                <p className="text-xs text-slate-300">
                  Bienvenue sur BookVerse Africa. Vous disposez d'un accès de découverte de 2 livres par semaine (jusqu'à 6 livres gratuits).
                </p>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Nom & Prénom</label>
                  <input
                    type="text"
                    required
                    placeholder="ex. Koffi Mensah"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Adresse Email</label>
                  <input
                    type="email"
                    required
                    placeholder="koffi@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Mot de passe</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Pays</label>
                    <input
                      type="text"
                      required
                      placeholder="Sénégal, CI, Cameroun..."
                      value={regCountry}
                      onChange={(e) => setRegCountry(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Numéro Mobile Money / Téléphone</label>
                  <input
                    type="tel"
                    required
                    placeholder="+221 77 000 00 00"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg transition cursor-pointer mt-2"
                >
                  S'inscrire comme Lecteur
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
