import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  BookOpen,
  Type,
  Highlighter,
  Bookmark,
  Sparkles,
  Search,
  Volume2,
  VolumeX,
  Play,
  Pause,
  List,
  Check,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { Book, ReadingNote } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface EBookReaderProps {
  book: Book;
  onClose: () => void;
}

export const EBookReader: React.FC<EBookReaderProps> = ({ book, onClose }) => {
  const { currentUser } = useAuth();
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = book.pages || 250;

  // Customization controls
  const [fontSize, setFontSize] = useState<number>(18); // px
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'mono' | 'dyslexic'>('serif');
  const [themeMode, setThemeMode] = useState<'clair' | 'sepia' | 'nuit'>('sepia');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Search in Book
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchMatchesCount, setSearchMatchesCount] = useState<number>(0);

  // Text-to-Speech (TTS)
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);

  // Bookmarks & Notes
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [bookmarks, setBookmarks] = useState<number[]>([12, 45]);
  const [selectedText, setSelectedText] = useState<string>('');
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);

  const currentChapter = book.chapters[currentChapterIndex] || {
    title: `Chapitre ${currentChapterIndex + 1}`,
    content: book.sampleText || 'Contenu du chapitre...',
  };

  // Search match computation
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchMatchesCount(0);
      return;
    }
    const regex = new RegExp(searchQuery, 'gi');
    const matches = (currentChapter.content || '').match(regex);
    setSearchMatchesCount(matches ? matches.length : 0);
  }, [searchQuery, currentChapter]);

  // TTS Speech Synthesis Handler
  const toggleTTS = () => {
    if (!('speechSynthesis' in window)) {
      alert('La synthèse vocale n’est pas supportée par votre navigateur.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentChapter.content);
      utterance.lang = 'fr-FR';
      utterance.rate = speechRate;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    } else if (currentChapterIndex < book.chapters.length - 1) {
      setCurrentChapterIndex((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    } else if (currentChapterIndex > 0) {
      setCurrentChapterIndex((prev) => prev - 1);
    }
  };

  const toggleBookmarkCurrentPage = () => {
    if (isBookmarked) {
      setBookmarks((prev) => prev.filter((p) => p !== currentPage));
      setIsBookmarked(false);
    } else {
      setBookmarks((prev) => [...prev, currentPage]);
      setIsBookmarked(true);
    }
  };

  const handleExplainTextWithAI = async (textSnippet: string) => {
    if (!textSnippet.trim()) return;
    setAiLoading(true);
    setAiExplanation(null);

    try {
      const data = await api.post<{ answer: string }>('/gemini/assistant', {
        bookTitle: book.title,
        author: book.authorName,
        question: `Explique la signification, le contexte culturel ou la métaphore de cet extrait : "${textSnippet}"`,
        contextText: currentChapter.content,
      });
      setAiExplanation(data.answer);
    } catch (err) {
      console.error('Error explaining text:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const themeClasses = {
    clair: 'bg-white text-slate-900 border-slate-200',
    sepia: 'bg-[#fbf0d9] text-[#433422] border-[#e8d2a7]',
    nuit: 'bg-slate-950 text-slate-100 border-slate-800',
  };

  const fontClasses = {
    serif: 'font-serif',
    sans: 'font-sans',
    mono: 'font-mono',
    dyslexic: 'font-sans tracking-wide leading-loose', // Enhanced spacing for accessibility
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col h-screen animate-fade-in select-none">
      {/* Reader Top Bar */}
      <header className={`px-6 py-3 border-b flex items-center justify-between transition-colors ${themeClasses[themeMode]}`}>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              onClose();
            }}
            className="p-2 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition cursor-pointer"
            title="Fermer le lecteur"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="hidden sm:block">
            <h2 className="font-serif font-bold text-sm line-clamp-1">{book.title}</h2>
            <p className="text-xs opacity-70">Par {book.authorName} • {currentChapter.title}</p>
          </div>
        </div>

        {/* Reader Display Controls */}
        <div className="flex items-center space-x-2">
          {/* TTS Audio Voice Button */}
          <button
            onClick={toggleTTS}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1.5 cursor-pointer transition ${
              isSpeaking
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
            }`}
            title="Lecture vocale intégrée"
          >
            {isSpeaking ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{isSpeaking ? 'Pause Voix' : 'Écouter'}</span>
          </button>

          {/* Theme switcher */}
          <div className="flex items-center p-1 rounded-lg bg-black/5 dark:bg-white/10 space-x-1">
            <button
              onClick={() => setThemeMode('clair')}
              className={`px-2 py-1 rounded text-xs font-bold transition cursor-pointer ${
                themeMode === 'clair' ? 'bg-white text-slate-900 shadow-xs' : 'opacity-70'
              }`}
            >
              Clair
            </button>
            <button
              onClick={() => setThemeMode('sepia')}
              className={`px-2 py-1 rounded text-xs font-bold transition cursor-pointer ${
                themeMode === 'sepia' ? 'bg-[#f4e2b8] text-[#3d2e1b] shadow-xs' : 'opacity-70'
              }`}
            >
              Sépia
            </button>
            <button
              onClick={() => setThemeMode('nuit')}
              className={`px-2 py-1 rounded text-xs font-bold transition cursor-pointer ${
                themeMode === 'nuit' ? 'bg-slate-900 text-white shadow-xs' : 'opacity-70'
              }`}
            >
              Nuit
            </button>
          </div>

          {/* Font Family Selector */}
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value as any)}
            className="hidden lg:block px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10 text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="serif">Serif (Classique)</option>
            <option value="sans">Sans-serif (Moderne)</option>
            <option value="mono">Mono (Étroit)</option>
            <option value="dyslexic">OpenDyslexie (Accessibilité)</option>
          </select>

          {/* Font Size Adjust */}
          <div className="hidden md:flex items-center space-x-1 px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10 text-xs font-bold">
            <button
              onClick={() => setFontSize(Math.max(12, fontSize - 2))}
              className="px-2 py-0.5 hover:bg-black/10 rounded cursor-pointer"
            >
              A-
            </button>
            <span>{fontSize}px</span>
            <button
              onClick={() => setFontSize(Math.min(28, fontSize + 2))}
              className="px-2 py-0.5 hover:bg-black/10 rounded cursor-pointer"
            >
              A+
            </button>
          </div>

          {/* Bookmark Toggle */}
          <button
            onClick={toggleBookmarkCurrentPage}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isBookmarked ? 'bg-amber-500 text-slate-950' : 'hover:bg-black/10 dark:hover:bg-white/10'
            }`}
            title="Marque-page"
          >
            <Bookmark className="w-5 h-5 fill-current" />
          </button>

          {/* Sidebar Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
            title="Sommaire & Recherche"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Reader Body with DRM Watermark Overlay */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Dynamic Anti-piracy DRM Watermark */}
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center opacity-[0.03] text-current font-mono text-2xl font-black rotate-[-30deg] select-none uppercase tracking-widest text-center px-8">
          DOCUMENT CERTIFIÉ PAR BOOKVERSE DRM • CLIENT: {currentUser.email} • ID: {currentUser.id}
        </div>

        {/* Main Book Page Content */}
        <main className={`flex-1 overflow-y-auto p-6 sm:p-12 lg:p-16 flex justify-center ${themeClasses[themeMode]}`}>
          <div
            className={`max-w-2xl w-full space-y-6 ${fontClasses[fontFamily]}`}
            style={{ fontSize: `${fontSize}px`, lineHeight: fontFamily === 'dyslexic' ? 2.2 : 1.8 }}
          >
            <div className="border-b border-current/10 pb-4 mb-6 flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-widest opacity-60">
                {currentChapter.title}
              </span>
              <span className="text-[10px] font-mono opacity-50 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>DRM Watermarked</span>
              </span>
            </div>

            <p className="first-letter:text-5xl first-letter:font-serif first-letter:font-extrabold first-letter:mr-3 first-letter:float-left whitespace-pre-line leading-relaxed selection:bg-amber-300 selection:text-slate-900">
              {currentChapter.content}
            </p>

            <div className="pt-8 opacity-70 text-center text-xs font-mono border-t border-current/10 mt-12">
              Page {currentPage} sur {totalPages} • Synchronisé avec BookVerse Cloud
            </div>
          </div>
        </main>

        {/* Sidebar: Chapters, Search, Notes & AI Assistant Drawer */}
        {sidebarOpen && (
          <aside className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 overflow-y-auto space-y-6 shadow-xl">
            {/* In-Book Search Input */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Rechercher dans le livre
              </h3>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Mot-clé ou phrase..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:outline-none"
                />
              </div>
              {searchQuery && (
                <p className="text-[10px] text-emerald-500 font-bold">
                  {searchMatchesCount} occurrence(s) trouvée(s) dans ce chapitre.
                </p>
              )}
            </div>

            {/* Chapters Table */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Table des Chapitres
              </h3>
              <div className="space-y-1">
                {book.chapters.map((chap, idx) => (
                  <button
                    key={chap.id}
                    onClick={() => {
                      setCurrentChapterIndex(idx);
                      setCurrentPage(idx * 20 + 1);
                    }}
                    className={`w-full text-left p-3 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-between ${
                      currentChapterIndex === idx
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{chap.title}</span>
                    {currentChapterIndex === idx && <Check className="w-4 h-4" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Bookmarks List */}
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Mes Marque-Pages ({bookmarks.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {bookmarks.map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-500 border border-amber-500/30 text-xs font-bold hover:bg-amber-500/30 cursor-pointer"
                  >
                    Page {p}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Text Inspector Helper */}
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 space-y-3">
              <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>Explication d'extrait par l'IA</span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Copiez un passage ou entrez une phrase ci-dessous pour obtenir une analyse littéraire et culturelle instantanée par Gemini :
              </p>
              <textarea
                rows={2}
                placeholder="Coller un extrait..."
                value={selectedText}
                onChange={(e) => setSelectedText(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => handleExplainTextWithAI(selectedText)}
                disabled={aiLoading || !selectedText.trim()}
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer disabled:opacity-50"
              >
                {aiLoading ? 'Analyse...' : 'Expliquer avec l’IA'}
              </button>

              {aiExplanation && (
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 space-y-1">
                  <span className="font-bold text-indigo-500">Explication Bookie :</span>
                  <p className="leading-relaxed">{aiExplanation}</p>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Reader Bottom Navigation Bar */}
      <footer className={`px-6 py-3 border-t flex items-center justify-between transition-colors ${themeClasses[themeMode]}`}>
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1 && currentChapterIndex === 0}
          className="px-4 py-2 rounded-xl bg-black/10 dark:bg-slate-800 hover:bg-black/20 font-bold text-xs flex items-center space-x-1 cursor-pointer disabled:opacity-30 border border-current/10"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Précédent</span>
        </button>

        <span className="text-xs font-mono font-bold">
          Page {currentPage} / {totalPages}
        </span>

        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages && currentChapterIndex === book.chapters.length - 1}
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center space-x-1 cursor-pointer disabled:opacity-30 shadow-md"
        >
          <span>Suivant</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
};
