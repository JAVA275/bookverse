import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, SubscriptionTier, Book } from '../types';
import { api, setAccessToken, getAccessToken } from '../services/api';
import { mapApiUserToProfile } from '../services/userMapper';

const GUEST_USER: UserProfile = {
  id: 'guest',
  name: 'Invité',
  email: '',
  role: 'reader',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  subscriptionTier: 'free',
  walletBalance: 0,
  phone: '',
  country: '',
  myLibraryBookIds: [],
  myAudiobookIds: [],
  bookmarkedPageByBookId: {},
  weeklyReadsCount: 0,
  totalReadsCount: 0,
};

interface AuthContextType {
  currentUser: UserProfile;
  isAuthenticated: boolean;
  authLoading: boolean;
  authError: string | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  login: (email: string, password: string) => Promise<UserProfile>;
  register: (input: { name: string; email: string; password: string; phone?: string; country?: string }) => Promise<UserProfile>;
  logout: () => Promise<void>;
  quotaModalType: 'weekly_limit' | 'total_limit' | 'author_limit' | null;
  setQuotaModalType: (type: 'weekly_limit' | 'total_limit' | 'author_limit' | null) => void;
  activeReadingBook: Book | null;
  setActiveReadingBook: (book: Book | null) => void;
  activeListeningBook: Book | null;
  setActiveListeningBook: (book: Book | null) => void;
  handleStartReading: (book: Book) => void;
  handleStartListening: (book: Book) => void;
  handleSubscribe: (tier: SubscriptionTier) => Promise<void>;
  refreshLibrary: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(GUEST_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const [quotaModalType, setQuotaModalType] = useState<'weekly_limit' | 'total_limit' | 'author_limit' | null>(null);
  const [activeReadingBook, setActiveReadingBook] = useState<Book | null>(null);
  const [activeListeningBook, setActiveListeningBook] = useState<Book | null>(null);

  // La bibliothèque (livres/audiobooks possédés) vient des vraies commandes payées
  // (GET /orders/mine) — avant cette fonction, myLibraryBookIds/myAudiobookIds restaient
  // toujours vides ou recopiés de l'état précédent, donc "Ma Bibliothèque" ne reflétait
  // jamais les achats réels d'un utilisateur.
  const loadLibraryFromOrders = async () => {
    try {
      const { orders } = await api.get<{ orders: any[] }>('/orders/mine');
      const ebookIds = new Set<string>();
      const audioIds = new Set<string>();
      for (const order of orders) {
        if (order.status !== 'PAID') continue;
        for (const item of order.items ?? []) {
          if (item.format === 'AUDIO') audioIds.add(item.bookId);
          else ebookIds.add(item.bookId);
        }
      }
      setCurrentUser((prev) =>
        prev
          ? { ...prev, myLibraryBookIds: Array.from(ebookIds), myAudiobookIds: Array.from(audioIds) }
          : prev
      );
    } catch {
      // Pas grave si ça échoue (ex: hors ligne) : la bibliothèque reste simplement vide.
    }
  };

  // Au chargement: si un access token existe déjà (ou qu'un refresh cookie est valide),
  // on tente de récupérer le profil courant pour restaurer la session.
  useEffect(() => {
    async function restoreSession() {
      try {
        if (!getAccessToken()) {
          // Pas de token en mémoire : on tente quand même un refresh silencieux
          // (le cookie httpOnly peut encore être valide après un rechargement de page).
          await api.post('/auth/refresh', undefined, { skipAuth: true }).catch(() => null);
        }
        const { user } = await api.get<{ user: any }>('/auth/me');
        setCurrentUser(mapApiUserToProfile(user));
        setIsAuthenticated(true);
        await loadLibraryFromOrders();
      } catch {
        setCurrentUser(GUEST_USER);
        setIsAuthenticated(false);
      } finally {
        setAuthLoading(false);
      }
    }
    restoreSession();
  }, []);

  const login = async (email: string, password: string) => {
    setAuthError(null);
    try {
      const { user, accessToken } = await api.post<{ user: any; accessToken: string }>(
        '/auth/login',
        { email, password },
        { skipAuth: true }
      );
      setAccessToken(accessToken);
      const profile = mapApiUserToProfile(user);
      setCurrentUser(profile);
      setIsAuthenticated(true);
      await loadLibraryFromOrders();
      return profile;
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Échec de la connexion');
      throw err;
    }
  };

  const register = async (input: { name: string; email: string; password: string; phone?: string; country?: string }) => {
    setAuthError(null);
    try {
      const { user, accessToken } = await api.post<{ user: any; accessToken: string }>(
        '/auth/register',
        input,
        { skipAuth: true }
      );
      setAccessToken(accessToken);
      const profile = mapApiUserToProfile(user);
      setCurrentUser(profile);
      setIsAuthenticated(true);
      return profile;
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Échec de l'inscription");
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setAccessToken(null);
      setCurrentUser(GUEST_USER);
      setIsAuthenticated(false);
    }
  };

  const handleStartReading = (book: Book) => {
    if (!isAuthenticated) return;
    if (currentUser.subscriptionTier === 'free') {
      const weekly = currentUser.weeklyReadsCount || 0;
      const total = currentUser.totalReadsCount || 0;

      if (weekly >= 2) {
        setQuotaModalType('weekly_limit');
        return;
      }
      if (total >= 6) {
        setQuotaModalType('total_limit');
        return;
      }

      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              weeklyReadsCount: (prev.weeklyReadsCount || 0) + 1,
              totalReadsCount: (prev.totalReadsCount || 0) + 1,
            }
          : prev
      );
    }

    setActiveReadingBook(book);
  };

  const handleStartListening = (book: Book) => {
    if (!isAuthenticated) return;
    if (currentUser.subscriptionTier === 'free') {
      const weekly = currentUser.weeklyReadsCount || 0;
      const total = currentUser.totalReadsCount || 0;

      if (weekly >= 2) {
        setQuotaModalType('weekly_limit');
        return;
      }
      if (total >= 6) {
        setQuotaModalType('total_limit');
        return;
      }

      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              weeklyReadsCount: (prev.weeklyReadsCount || 0) + 1,
              totalReadsCount: (prev.totalReadsCount || 0) + 1,
            }
          : prev
      );
    }

    setActiveListeningBook(book);
  };

  const handleSubscribe = async (tier: SubscriptionTier) => {
    const planId = tier.toUpperCase() as 'FREE' | 'PREMIUM' | 'PREMIUM_PLUS';
    try {
      const { subscription } = await api.post<{ subscription: { planId: string } }>('/subscriptions', {
        planId,
      });
      setCurrentUser((prev) =>
        prev ? { ...prev, subscriptionTier: subscription.planId.toLowerCase() as SubscriptionTier } : prev
      );
      setQuotaModalType(null);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Échec de l'abonnement.");
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        authLoading,
        authError,
        setCurrentUser,
        login,
        register,
        logout,
        quotaModalType,
        setQuotaModalType,
        activeReadingBook,
        setActiveReadingBook,
        activeListeningBook,
        setActiveListeningBook,
        handleStartReading,
        handleStartListening,
        handleSubscribe,
        refreshLibrary: loadLibraryFromOrders,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
