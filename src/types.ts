export type UserRole = 'reader' | 'author' | 'admin' | 'publisher';

export type BookFormat = 'ebook' | 'audio' | 'physical' | 'bundle';

export type SubscriptionTier = 'free' | 'premium' | 'premium_plus';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  subscriptionTier: SubscriptionTier;
  walletBalance: number; // in FCFA
  phone: string;
  country: string;
  bio?: string;
  myLibraryBookIds: string[];
  myAudiobookIds: string[];
  bookmarkedPageByBookId: Record<string, number>;
  weeklyReadsCount?: number;
  totalReadsCount?: number;
  publishedBooksCount?: number;
}

export interface BookCategory {
  id: string;
  name: string;
  description: string;
  iconName?: string;
  bookCount?: number;
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  content: string;
  durationSeconds?: number; // for audio
  audioUrl?: string;
}

export interface BookReview {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number; // 1 to 5
  comment: string;
  date: string;
  likes: number;
}

export interface Book {
  id: string;
  title: string;
  subtitle?: string;
  authorId: string;
  authorName: string;
  publisher: string;
  category: string;
  description: string;
  coverUrl: string;
  priceEbook: number; // FCFA
  pricePhysical: number; // FCFA
  priceAudio: number; // FCFA
  isFreeWithSubscription: boolean;
  rating: number;
  reviewsCount: number;
  pages: number;
  audioDuration: string; // e.g. "6h 45m"
  sampleText: string;
  chapters: Chapter[];
  publishDate: string;
  isbn: string;
  language: string;
  stockPhysical: number;
  downloadsCount: number;
  salesCount: number;
  featured?: boolean;
  bestseller?: boolean;
  isNewRelease?: boolean;
}

export interface CartItem {
  id: string;
  book: Book;
  format: BookFormat;
  price: number;
  quantity: number;
}

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  priceMonthly: number; // FCFA
  priceYearly: number; // FCFA
  badge: string;
  features: string[];
  popular?: boolean;
  color: string;
}

export interface PODQuoteRequest {
  pages: number;
  quantity: number;
  paperType: 'blanc_80g' | 'creme_80g' | 'glace_115g';
  coverFinish: 'mat' | 'brillant';
  binding: 'broche' | 'relie';
  formatSize: 'A5' | 'A4' | 'Roman';
}

export interface PublishingService {
  id: string;
  title: string;
  description: string;
  price: number; // FCFA
  iconName: string;
  estimatedDays: number;
}

export interface PublishingRequest {
  id: string;
  authorName: string;
  authorEmail: string;
  bookTitle: string;
  servicesRequested: string[];
  status: 'en_attente' | 'en_cours' | 'valide' | 'termine';
  totalPrice: number;
  createdAt: string;
}

export interface PaymentDetails {
  method: 'orange_money' | 'mtn_momo' | 'card' | 'paypal' | 'stripe';
  phoneNumber?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cvv?: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  items: CartItem[];
  totalAmount: number;
  paymentMethod: string;
  status: 'paye' | 'en_preparation' | 'expedie' | 'livre';
  date: string;
  deliveryAddress?: string;
  trackingNumber?: string;
}

export interface BookClub {
  id: string;
  title: string;
  description: string;
  bookId: string;
  bookTitle: string;
  bookCover: string;
  membersCount: number;
  nextMeetingDate: string;
  currentChapter: string;
  moderatorName: string;
  moderatorAvatar: string;
}

export interface ReadingNote {
  id: string;
  bookId: string;
  chapterNumber: number;
  pageNumber: number;
  selectedText: string;
  noteText: string;
  createdAt: string;
  color: string;
}
