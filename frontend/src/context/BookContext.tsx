import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Book, BookCategory } from '../types';
import { api } from '../services/api';

// Payload envoyé par le formulaire "Publier un livre" de l'auteur — ce n'est PAS un Book
// complet : les champs calculés/contrôlés côté serveur (isPublished, rating, salesCount,
// downloadsCount, dates...) ne sont jamais fournis par le client (voir book.service.ts
// côté backend, qui les ignore de toute façon même si on les envoyait).
export interface NewBookInput {
  title: string;
  subtitle?: string;
  description: string;
  coverUrl: string;
  priceEbookFcfa: number;
  pricePhysicalFcfa: number;
  priceAudioFcfa: number;
  isbn?: string;
  language: string;
  pages: number;
  categoryId?: string;
}

interface BookContextType {
  books: Book[];
  categories: BookCategory[];
  booksLoading: boolean;
  booksError: string | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  addBook: (input: NewBookInput) => Promise<Book>;
  addCategory: (newCat: { name: string; description?: string; iconName?: string }) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  refreshBooks: () => Promise<void>;
  selectedBook: Book | null;
  setSelectedBook: (book: Book | null) => void;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<BookCategory[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [booksError, setBooksError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Charge le vrai catalogue depuis l'API. NB: /api/books est paginé côté serveur
  // (20 par page par défaut) ; on demande ici la taille de page maximale (100) pour
  // afficher tout le catalogue publié dans le magasin sans construire une pagination
  // dédiée — à revoir si le catalogue dépasse 100 titres.
  const refreshBooks = useCallback(async () => {
    setBooksLoading(true);
    setBooksError(null);
    try {
      const { books: apiBooks } = await api.get<{ books: Book[] }>('/books?pageSize=100');
      setBooks(apiBooks);
    } catch (err) {
      setBooksError(err instanceof Error ? err.message : 'Impossible de charger le catalogue.');
    } finally {
      setBooksLoading(false);
    }
  }, []);

  const refreshCategories = useCallback(async () => {
    try {
      const { categories: apiCategories } = await api.get<{ categories: BookCategory[] }>('/categories');
      setCategories(apiCategories);
    } catch {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    refreshBooks();
    refreshCategories();
  }, [refreshBooks, refreshCategories]);

  const addBook = async (input: NewBookInput) => {
    const { book } = await api.post<{ book: Book }>('/books', input);
    // Le livre créé est un brouillon (isPublished: false) tant qu'un modérateur ne l'a pas
    // validé — voir POST /books/:id/publish et l'onglet "Modération" du Dashboard Admin.
    setBooks((prev) => [book, ...prev]);
    return book;
  };

  const addCategory = async (newCat: { name: string; description?: string; iconName?: string }) => {
    const { category } = await api.post<{ category: BookCategory }>('/categories', newCat);
    setCategories((prev) => [...prev, category]);
  };

  const deleteCategory = async (id: string) => {
    await api.delete(`/categories/${id}`);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <BookContext.Provider
      value={{
        books,
        categories,
        booksLoading,
        booksError,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        addBook,
        addCategory,
        deleteCategory,
        refreshBooks,
        selectedBook,
        setSelectedBook,
      }}
    >
      {children}
    </BookContext.Provider>
  );
};

export const useBooks = () => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error('useBooks must be used within a BookProvider');
  }
  return context;
};
