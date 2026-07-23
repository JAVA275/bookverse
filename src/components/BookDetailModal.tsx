import React, { useState } from 'react';
import {
  X,
  Star,
  BookOpen,
  Headphones,
  ShoppingBag,
  Sparkles,
  CheckCircle,
  FileText,
  Clock,
  Globe,
  Share2,
  Send,
  MessageSquare,
  Bot
} from 'lucide-react';
import { Book, BookFormat, BookReview, UserProfile } from '../types';
import { MOCK_REVIEWS } from '../data/mockData';

interface BookDetailModalProps {
  book: Book | null;
  onClose: () => void;
  onAddToCart: (book: Book, format: BookFormat) => void;
  onStartReading: (book: Book) => void;
  onStartListening: (book: Book) => void;
  currentUser: UserProfile;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  onClose,
  onAddToCart,
  onStartReading,
  onStartListening,
  currentUser,
}) => {
  if (!book) return null;

  const [activeTab, setActiveTab] = useState<'details' | 'chapters' | 'reviews' | 'ai_summary' | 'ai_assistant'>('details');

  // AI Summarizer State
  const [aiSummaryData, setAiSummaryData] = useState<any | null>(null);
  const [aiSummaryLoading, setAiSummaryLoading] = useState<boolean>(false);

  // AI Assistant Chat State
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text: `Bonjour ! Je suis Bookie, votre assistant IA pour "${book.title}". Posez-moi vos questions sur l'intrigue, les thèmes ou les personnages !`,
    },
  ]);
  const [userQuestion, setUserQuestion] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  // Reviews State
  const [reviews, setReviews] = useState<BookReview[]>(
    MOCK_REVIEWS.filter((r) => r.bookId === book.id)
  );
  const [newComment, setNewComment] = useState<string>('');
  const [newRating, setNewRating] = useState<number>(5);

  const handleGenerateSummary = async () => {
    setAiSummaryLoading(true);
    try {
      const res = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: book.title,
          author: book.authorName,
          description: book.description,
          textSnippet: book.sampleText,
        }),
      });
      const data = await res.json();
      setAiSummaryData(data);
    } catch (error) {
      console.error('Error in handleGenerateSummary:', error);
    } finally {
      setAiSummaryLoading(false);
    }
  };

  const handleSendQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuestion.trim()) return;

    const q = userQuestion;
    setUserQuestion('');
    setChatMessages((prev) => [...prev, { role: 'user', text: q }]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/gemini/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookTitle: book.title,
          author: book.authorName,
          question: q,
          contextText: book.description,
        }),
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data.answer || "Désolé, je n'ai pas pu répondre à votre question." },
      ]);
    } catch (error) {
      console.error('Error asking assistant:', error);
    } finally {
      setChatLoading(false);
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const rev: BookReview = {
      id: `rev_${Date.now()}`,
      bookId: book.id,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      rating: newRating,
      comment: newComment,
      date: new Date().toISOString().split('T')[0],
      likes: 0,
    };

    setReviews([rev, ...reviews]);
    setNewComment('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bento-card max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-slate-800 animate-fade-in">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {book.category}
            </span>
            <span className="text-xs text-slate-400">ISBN: {book.isbn}</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Book Cover & Quick Purchase Card */}
            <div className="w-full md:w-1/3 flex flex-col space-y-4">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-950 shadow-lg relative group border border-slate-800">
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Options de format
                </h4>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300 font-medium">eBook (PDF/EPUB)</span>
                  <span className="font-extrabold text-emerald-400 font-mono">
                    {book.priceEbook.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300 font-medium">Livre Imprimé (Papier)</span>
                  <span className="font-extrabold text-emerald-400 font-mono">
                    {book.pricePhysical.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300 font-medium">Livre Audio Narré</span>
                  <span className="font-extrabold text-emerald-400 font-mono">
                    {book.priceAudio.toLocaleString('fr-FR')} FCFA
                  </span>
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    onClick={() => onStartReading(book)}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm flex items-center justify-center space-x-2 transition cursor-pointer shadow-xs"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Lire un Extrait</span>
                  </button>

                  <button
                    onClick={() => onStartListening(book)}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-sm flex items-center justify-center space-x-2 transition cursor-pointer shadow-xs border border-slate-700"
                  >
                    <Headphones className="w-4 h-4" />
                    <span>Écouter l'Extrait Audio</span>
                  </button>

                  <button
                    onClick={() => onAddToCart(book, 'ebook')}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center space-x-2 transition cursor-pointer border border-slate-800"
                  >
                    <ShoppingBag className="w-4 h-4 text-emerald-400" />
                    <span>Ajouter au Panier</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Book Details & Navigation Tabs */}
            <div className="w-full md:w-2/3 space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white">
                  {book.title}
                </h1>
                {book.subtitle && (
                  <p className="text-sm font-medium text-emerald-400 mt-1">
                    {book.subtitle}
                  </p>
                )}
                <p className="text-sm text-slate-300 mt-2">
                  Par <strong className="text-white">{book.authorName}</strong> • Édité par {book.publisher}
                </p>

                <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-400">
                  <span className="flex items-center text-amber-400 font-bold text-sm">
                    <Star className="w-4 h-4 fill-current mr-1" />
                    {book.rating} ({book.reviewsCount} avis)
                  </span>
                  <span className="flex items-center">
                    <FileText className="w-4 h-4 mr-1 text-slate-400" />
                    {book.pages} pages
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-slate-400" />
                    {book.audioDuration}
                  </span>
                  <span className="flex items-center">
                    <Globe className="w-4 h-4 mr-1 text-slate-400" />
                    {book.language}
                  </span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-800 space-x-4 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`pb-3 text-sm font-bold border-b-2 cursor-pointer transition ${
                    activeTab === 'details'
                      ? 'border-emerald-400 text-emerald-400'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  Présentation
                </button>
                <button
                  onClick={() => setActiveTab('chapters')}
                  className={`pb-3 text-sm font-bold border-b-2 cursor-pointer transition ${
                    activeTab === 'chapters'
                      ? 'border-emerald-400 text-emerald-400'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  Chapitres ({book.chapters.length})
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-3 text-sm font-bold border-b-2 cursor-pointer transition ${
                    activeTab === 'reviews'
                      ? 'border-emerald-400 text-emerald-400'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  Avis & Notes ({reviews.length})
                </button>
                <button
                  onClick={() => setActiveTab('ai_summary')}
                  className={`pb-3 text-sm font-bold border-b-2 cursor-pointer transition flex items-center space-x-1 ${
                    activeTab === 'ai_summary'
                      ? 'border-emerald-400 text-emerald-400'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Résumé IA</span>
                </button>
                <button
                  onClick={() => setActiveTab('ai_assistant')}
                  className={`pb-3 text-sm font-bold border-b-2 cursor-pointer transition flex items-center space-x-1 ${
                    activeTab === 'ai_assistant'
                      ? 'border-emerald-400 text-emerald-400'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Assistant IA</span>
                </button>
              </div>

              {/* Tab: Details */}
              {activeTab === 'details' && (
                <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
                  <h3 className="font-bold text-white text-base">
                    À propos du livre
                  </h3>
                  <p className="whitespace-pre-line">{book.description}</p>
                </div>
              )}

              {/* Tab: Chapters */}
              {activeTab === 'chapters' && (
                <div className="space-y-3">
                  {book.chapters.map((chap) => (
                    <div
                      key={chap.id}
                      className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <h4 className="font-bold text-white text-sm">
                          {chap.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                          {chap.content}
                        </p>
                      </div>
                      <button
                        onClick={() => onStartReading(book)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500 hover:text-slate-950 transition cursor-pointer border border-emerald-500/30"
                      >
                        Lire
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab: Reviews */}
              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  {/* Write a review form */}
                  <form onSubmit={handleAddReview} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Laisser votre avis de lecteur
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-400">Note :</span>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setNewRating(s)}
                          className="p-1 cursor-pointer"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              s <= newRating ? 'text-amber-400 fill-current' : 'text-slate-700'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Qu'avez-vous pensé de cet ouvrage ?"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs cursor-pointer"
                    >
                      Publier mon avis
                    </button>
                  </form>

                  {/* Reviews List */}
                  <div className="space-y-3">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <img src={rev.userAvatar} alt={rev.userName} className="w-7 h-7 rounded-full object-cover" />
                            <div>
                              <p className="text-xs font-bold text-white">{rev.userName}</p>
                              <p className="text-[10px] text-slate-400">{rev.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center text-amber-400 text-xs font-bold">
                            <Star className="w-3.5 h-3.5 fill-current mr-1" />
                            {rev.rating}/5
                          </div>
                        </div>
                        <p className="text-xs text-slate-300">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab: AI Summary */}
              {activeTab === 'ai_summary' && (
                <div className="space-y-4">
                  {!aiSummaryData && (
                    <div className="text-center py-8 space-y-3">
                      <Sparkles className="w-10 h-10 text-amber-400 mx-auto animate-bounce" />
                      <h4 className="font-bold text-white text-base">
                        Générer un résumé analytique structuré par l'IA
                      </h4>
                      <p className="text-xs text-slate-400 max-w-md mx-auto">
                        Notre IA Gemini va analyser le livre pour extraire les thèmes majeurs, le public cible et un résumé complet.
                      </p>
                      <button
                        onClick={handleGenerateSummary}
                        disabled={aiSummaryLoading}
                        className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-md transition cursor-pointer disabled:opacity-50"
                      >
                        {aiSummaryLoading ? 'Analyse par Gemini en cours...' : 'Lancer le résumé IA'}
                      </button>
                    </div>
                  )}

                  {aiSummaryData && (
                    <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-4 text-xs text-slate-200">
                      <div>
                        <h4 className="font-bold text-emerald-400 text-sm mb-1">
                          Résumé de l'Ouvrage
                        </h4>
                        <p className="leading-relaxed">{aiSummaryData.summary}</p>
                      </div>

                      {aiSummaryData.keyThemes && (
                        <div>
                          <h4 className="font-bold text-emerald-400 text-sm mb-1">
                            Thèmes Majeurs
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {aiSummaryData.keyThemes.map((theme: string, i: number) => (
                              <span key={i} className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                                #{theme}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {aiSummaryData.whyRead && (
                        <div>
                          <h4 className="font-bold text-emerald-400 text-sm mb-1">
                            Pourquoi lire ce livre ?
                          </h4>
                          <p>{aiSummaryData.whyRead}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Tab: AI Assistant Chat */}
              {activeTab === 'ai_assistant' && (
                <div className="space-y-4 flex flex-col h-80">
                  <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
                    {chatMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-emerald-500 text-slate-950 font-medium rounded-br-none'
                              : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none shadow-xs'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="text-xs text-slate-400 italic flex items-center space-x-1">
                        <Bot className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                        <span>Bookie réfléchit...</span>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleSendQuestion} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Posez une question sur le livre..."
                      value={userQuestion}
                      onChange={(e) => setUserQuestion(e.target.value)}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 text-xs text-white border border-slate-800 focus:border-emerald-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={chatLoading}
                      className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 cursor-pointer disabled:opacity-50 font-bold"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
