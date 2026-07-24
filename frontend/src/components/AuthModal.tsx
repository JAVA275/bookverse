import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { Shield, User, Lock, Mail, Phone, Globe, Check, X, Sparkles, KeyRound, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [submitting, setSubmitting] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Visitor Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCountry, setRegCountry] = useState('Sénégal');
  const [regSuccess, setRegSuccess] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setSubmitting(true);
    try {
      const user = await login(loginEmail.trim(), loginPassword);
      onLoginSuccess(user);
      onClose();
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Email ou mot de passe incorrect.');
    } finally {
      setSubmitting(false);
    }
  };

  const [regError, setRegError] = useState('');

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setSubmitting(true);
    try {
      const user = await register({
        name: regName || 'Nouveau Lecteur',
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        country: regCountry,
      });
      setRegSuccess(true);
      setTimeout(() => {
        onLoginSuccess(user);
        onClose();
      }, 1500);
    } catch (err) {
      setRegError(err instanceof Error ? err.message : "Échec de l'inscription.");
    } finally {
      setSubmitting(false);
    }
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
                <strong className="block text-white">Comptes de démonstration (après `npm run prisma:seed`) :</strong>
                <span>admin@bookverse.cm · auteur@bookverse.cm · lecteur@bookverse.cm — mot de passe : <code className="text-amber-300 font-mono">Password123</code></span>
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
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg transition cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Connexion...' : 'Se Connecter'}
            </button>

            {/* Raccourcis vers les comptes de démo seedés (npm run prisma:seed) */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block text-center">
                Accès Rapide Démo
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => { setLoginEmail('lecteur@bookverse.cm'); setLoginPassword('Password123'); }}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition text-center cursor-pointer font-medium"
                >
                  Lecteur Démo
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginEmail('auteur@bookverse.cm'); setLoginPassword('Password123'); }}
                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition text-center cursor-pointer font-medium"
                >
                  Auteur Démo
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
                {regError && (
                  <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                    {regError}
                  </div>
                )}
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
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-lg transition cursor-pointer mt-2 disabled:opacity-50"
                >
                  {submitting ? 'Inscription...' : "S'inscrire comme Lecteur"}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
