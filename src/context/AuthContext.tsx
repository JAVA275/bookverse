import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, SubscriptionTier, Book } from '../types';
import { MOCK_USERS } from '../data/mockData';

interface AuthContextType {
  currentUser: UserProfile;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  quotaModalType: 'weekly_limit' | 'total_limit' | 'author_limit' | null;
  setQuotaModalType: (type: 'weekly_limit' | 'total_limit' | 'author_limit' | null) => void;
  activeReadingBook: Book | null;
  setActiveReadingBook: (book: Book | null) => void;
  activeListeningBook: Book | null;
  setActiveListeningBook: (book: Book | null) => void;
  handleStartReading: (book: Book) => void;
  handleStartListening: (book: Book) => void;
  handleSubscribe: (tier: SubscriptionTier) => void;
  handleRoleChange: (role: 'reader' | 'author' | 'admin') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('bookverse_user');
    return saved ? JSON.parse(saved) : MOCK_USERS.reader;
  });

  const [quotaModalType, setQuotaModalType] = useState<'weekly_limit' | 'total_limit' | 'author_limit' | null>(null);
  const [activeReadingBook, setActiveReadingBook] = useState<Book | null>(null);
  const [activeListeningBook, setActiveListeningBook] = useState<Book | null>(null);

  useEffect(() => {
    localStorage.setItem('bookverse_user', JSON.stringify(currentUser));
  }, [currentUser]);

  const handleStartReading = (book: Book) => {
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

      setCurrentUser((prev) => ({
        ...prev,
        weeklyReadsCount: (prev.weeklyReadsCount || 0) + 1,
        totalReadsCount: (prev.totalReadsCount || 0) + 1,
      }));
    }

    setActiveReadingBook(book);
  };

  const handleStartListening = (book: Book) => {
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

      setCurrentUser((prev) => ({
        ...prev,
        weeklyReadsCount: (prev.weeklyReadsCount || 0) + 1,
        totalReadsCount: (prev.totalReadsCount || 0) + 1,
      }));
    }

    setActiveListeningBook(book);
  };

  const handleSubscribe = (tier: SubscriptionTier) => {
    setCurrentUser((prev) => ({
      ...prev,
      subscriptionTier: tier,
    }));
    setQuotaModalType(null);
  };

  const handleRoleChange = (role: 'reader' | 'author' | 'admin') => {
    setCurrentUser(MOCK_USERS[role]);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        quotaModalType,
        setQuotaModalType,
        activeReadingBook,
        setActiveReadingBook,
        activeListeningBook,
        setActiveListeningBook,
        handleStartReading,
        handleStartListening,
        handleSubscribe,
        handleRoleChange,
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
