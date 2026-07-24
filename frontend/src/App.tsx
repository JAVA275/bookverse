import React, { useState, Suspense, lazy } from 'react';
import { Header } from './components/Header';
import { StoreFront } from './components/StoreFront';
import { BookDetailModal } from './components/BookDetailModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import { QuotaLimitModal } from './components/QuotaLimitModal';
import { CartCheckoutModal } from './components/CartCheckoutModal';

import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { BookProvider, useBooks } from './context/BookContext';
import { Book, SubscriptionTier } from './types';

// Lazy loaded views for optimal app performance
const EBookReader = lazy(() => import('./components/eBookReader').then(m => ({ default: m.EBookReader })));
const AudioPlayer = lazy(() => import('./components/AudioPlayer').then(m => ({ default: m.AudioPlayer })));
const SubscriptionsView = lazy(() => import('./components/SubscriptionsView').then(m => ({ default: m.SubscriptionsView })));
const PublishingStudio = lazy(() => import('./components/PublishingStudio').then(m => ({ default: m.PublishingStudio })));
const AuthorDashboard = lazy(() => import('./components/AuthorDashboard').then(m => ({ default: m.AuthorDashboard })));
const AdminDashboard = lazy(() => import('./components/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const UserLibraryView = lazy(() => import('./components/UserLibraryView').then(m => ({ default: m.UserLibraryView })));

function MainContent() {
  const { darkMode, setDarkMode } = useTheme();
  const {
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
  } = useAuth();

  const {
    cartItems,
    cartOpen,
    setCartOpen,
    addToCart,
    removeFromCart,
    clearCart,
  } = useCart();

  const {
    books,
    categories,
    searchQuery,
    setSearchQuery,
    addBook,
    addCategory,
    deleteCategory,
    selectedBook,
    setSelectedBook,
  } = useBooks();

  const [activeTab, setActiveTab] = useState<string>('store');
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors font-sans antialiased">
      {/* Platform Header */}
      <Header
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartItems.reduce((acc, cur) => acc + cur.quantity, 0)}
        onOpenCart={() => setCartOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Main App Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <Suspense
          fallback={
            <div className="p-12 text-center text-slate-400 font-mono text-xs animate-pulse">
              Chargement du module BookVerse en cours...
            </div>
          }
        >
          {activeTab === 'store' && (
            <StoreFront
              books={books}
              onSelectBook={(bk) => setSelectedBook(bk)}
              onAddToCart={addToCart}
              currentUser={currentUser}
              searchQuery={searchQuery}
              onStartReading={handleStartReading}
              onStartListening={handleStartListening}
            />
          )}

          {activeTab === 'library' && (
            <UserLibraryView
              currentUser={currentUser}
              books={books}
              onStartReading={handleStartReading}
              onStartListening={handleStartListening}
            />
          )}

          {activeTab === 'publishing' && (
            <PublishingStudio currentUser={currentUser} />
          )}

          {activeTab === 'subscriptions' && (
            <SubscriptionsView
              currentUser={currentUser}
              onUpdateSubscription={handleSubscribe}
            />
          )}

          {activeTab === 'author_dashboard' && (
            <AuthorDashboard
              currentUser={currentUser}
              books={books}
              categories={categories}
              onPublishBook={addBook}
              onOpenQuotaModal={(type) => setQuotaModalType(type)}
            />
          )}

          {activeTab === 'admin_dashboard' && (
            <AdminDashboard
              currentUser={currentUser}
              books={books}
              categories={categories}
              onAddCategory={addCategory}
              onDeleteCategory={deleteCategory}
            />
          )}
        </Suspense>
      </main>

      {/* Book Detail Modal */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onAddToCart={addToCart}
          onStartReading={(bk) => {
            setSelectedBook(null);
            handleStartReading(bk);
          }}
          onStartListening={(bk) => {
            setSelectedBook(null);
            handleStartListening(bk);
          }}
          currentUser={currentUser}
        />
      )}

      {/* Interactive eBook Reader Modal */}
      <Suspense fallback={null}>
        {activeReadingBook && (
          <EBookReader
            book={activeReadingBook}
            onClose={() => setActiveReadingBook(null)}
          />
        )}

        {/* Audiobook Sticky Player Bar */}
        {activeListeningBook && (
          <AudioPlayer
            book={activeListeningBook}
            onClose={() => setActiveListeningBook(null)}
          />
        )}
      </Suspense>

      {/* Shopping Cart Drawer / Checkout Modal */}
      {cartOpen && (
        <CartCheckoutModal
          items={cartItems}
          onClose={() => setCartOpen(false)}
          onRemoveItem={(id) => removeFromCart(id)}
          onClearCart={clearCart}
          currentUser={currentUser}
        />
      )}

      {/* User Profile & Photo Edit Modal */}
      {profileModalOpen && (
        <ProfileModal
          currentUser={currentUser}
          onClose={() => setProfileModalOpen(false)}
          onUpdateProfile={(updated) => setCurrentUser(updated)}
        />
      )}

      {/* Auth Modal (Admin Login + Visitor Register) */}
      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            if (user.role === 'admin') setActiveTab('admin_dashboard');
            else if (user.role === 'author') setActiveTab('author_dashboard');
            else setActiveTab('store');
          }}
        />
      )}

      {/* Quota Limit Enforcement Modal */}
      {quotaModalType && (
        <QuotaLimitModal
          type={quotaModalType}
          onClose={() => setQuotaModalType(null)}
          onSubscribeClick={() => {
            setQuotaModalType(null);
            setActiveTab('subscriptions');
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BookProvider>
          <CartProvider>
            <MainContent />
          </CartProvider>
        </BookProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}


