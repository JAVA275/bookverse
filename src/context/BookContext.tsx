import React, { createContext, useContext, useState, useEffect } from 'react';
import { Book, BookCategory } from '../types';
import { MOCK_BOOKS, DEFAULT_CATEGORIES } from '../data/mockData';

interface BookContextType {
  books: Book[];
  categories: BookCategory[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  addBook: (newBook: Book) => void;
  addCategory: (newCat: BookCategory) => void;
  deleteCategory: (id: string) => void;
  selectedBook: Book | null;
  setSelectedBook: (book: Book | null) => void;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [books, setBooks] = useState<Book[]>(MOCK_BOOKS);
  const [categories, setCategories] = useState<BookCategory[]>(DEFAULT_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Sync books & categories from server
  useEffect(() => {
    fetch('/api/books')
      .then((res) => res.json())
      .then((data) => {
        if (data.books && Array.isArray(data.books)) {
          setBooks((prev) => {
            const existingIds = new Set(data.books.map((b: Book) => b.id));
            const localOnly = prev.filter((b) => !existingIds.has(b.id));
            return [...data.books, ...localOnly];
          });
        }
      })
      .catch((err) => console.log('Using local book cache:', err));

    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      })
      .catch((err) => console.log('Using default categories:', err));
  }, []);

  const addBook = (newBook: Book) => {
    setBooks((prev) => [newBook, ...prev]);
    // Optionally push to backend
    fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBook),
    }).catch((err) => console.error('Failed to sync book to server:', err));
  };

  const addCategory = (newCat: BookCategory) => {
    setCategories((prev) => [...prev, newCat]);
    fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCat),
    }).catch((err) => console.error('Failed to sync category:', err));
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    fetch(`/api/categories/${id}`, { method: 'DELETE' }).catch((err) =>
      console.error('Failed to delete category:', err)
    );
  };

  return (
    <BookContext.Provider
      value={{
        books,
        categories,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        addBook,
        addCategory,
        deleteCategory,
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
