import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API client lazily / safely
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("La clé d'API GEMINI_API_KEY n'est pas configurée.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// API Health
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Mock Server In-Memory DB for persistent operations during app lifecycle
let SERVER_BOOKS = [
  {
    id: 'b1',
    title: 'L’Aventure Ambiguë',
    subtitle: 'Récit philosophique d’un destin d’Afrique',
    authorId: 'u2',
    authorName: 'Cheikh Hamidou Kane',
    publisher: 'Maison d’Édition BookVerse',
    category: 'Roman & Fiction',
    description: 'Une œuvre magistrale sur la confrontation entre les valeurs traditionnelles spirituelles et la modernité occidentale.',
    coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    priceEbook: 2500,
    pricePhysical: 6500,
    priceAudio: 3000,
    isFreeWithSubscription: true,
    rating: 4.9,
    reviewsCount: 142,
    pages: 192,
    audioDuration: '5h 12m',
    sampleText: 'Samba Diallo était issu de la noble famille des Diallobé...',
    chapters: [
      { id: 'c1_1', number: 1, title: 'Chapitre I : L’École Coranique du Maître Thierno', content: 'Le Maître Thierno s’était arrêté. Pendant un long moment, il considéra le garçon. La parole de Dieu résonnait encore dans la cour sombre...' },
      { id: 'c1_2', number: 2, title: 'Chapitre II : L’Appel de la Grande Royale', content: 'La Grande Royale, sœur du chef des Diallobé, marcha à pas lents vers la grande concession...' }
    ],
    publishDate: '1961-05-15',
    isbn: '978-2-266-11145-8',
    language: 'Français',
    stockPhysical: 45,
    downloadsCount: 3820,
    salesCount: 1250,
    isNewRelease: false
  },
  {
    id: 'b2',
    title: 'Une Si Longue Lettre',
    subtitle: 'Masterpiece du roman épistolaire africain',
    authorId: 'u3',
    authorName: 'Mariama Bâ',
    publisher: 'Nouvelles Éditions Africaines',
    category: 'Roman & Fiction',
    description: 'Un témoignage émouvant et lucide sur la condition féminine, le veuvage, le mariage et les mutations de la société sénégalaise.',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    priceEbook: 2000,
    pricePhysical: 5000,
    priceAudio: 2500,
    isFreeWithSubscription: true,
    rating: 4.8,
    reviewsCount: 98,
    pages: 160,
    audioDuration: '4h 05m',
    sampleText: 'Chère Aïssatou, j’ai reçu ton mot. En réponse, j’ouvre ce cahier, point d’appui dans ma détresse...',
    chapters: [
      { id: 'c2_1', number: 1, title: 'Lettre I : L’annonce du deuil', content: 'Chère Aïssatou, j’ai reçu ton mot. Modou est mort. Comment te dire la brutalité de la nouvelle ?' }
    ],
    publishDate: '1979-10-20',
    isbn: '978-2-84260-029-5',
    language: 'Français',
    stockPhysical: 120,
    downloadsCount: 5120,
    salesCount: 2300,
    isNewRelease: false
  }
];

let SERVER_CATEGORIES = [
  { id: 'cat_01', name: 'Roman & Fiction', description: 'Littérature, œuvres narratives et récits romanesques.', bookCount: 12 },
  { id: 'cat_02', name: 'Essais & Philosophie', description: 'Réflexions politiques, culturelles et sociologiques.', bookCount: 8 },
  { id: 'cat_03', name: 'Histoire & Héritage', description: 'Mémoires, archives et histoire des civilisations.', bookCount: 15 },
  { id: 'cat_04', name: 'Jeunesse & Contes', description: 'Contes initiatiques, légendes du soir et albums.', bookCount: 6 },
  { id: 'cat_05', name: 'Poésie & Théâtre', description: 'Récitals poétiques, slam et dramaturgie.', bookCount: 4 }
];

let SERVER_PAYMENTS: any[] = [];

// API: Auth Login Endpoint
app.post("/api/auth/login", (req, res) => {
  const { email, password, role } = req.body;
  
  if (role === 'admin' && password !== 'admin123' && password !== 'admin') {
    return res.status(401).json({ error: "Mot de passe administrateur incorrect." });
  }

  const token = `jwt_token_bookverse_${Date.now()}`;
  res.json({
    success: true,
    token,
    user: {
      id: role === 'admin' ? 'usr_admin' : role === 'author' ? 'u2' : 'usr_reader_01',
      name: role === 'admin' ? 'Super Admin BookVerse' : role === 'author' ? 'Cheikh Hamidou Kane' : (email ? email.split('@')[0] : 'Lecteur Passionné'),
      email: email || 'lecteur@bookverse.africa',
      role: role || 'reader',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      subscriptionTier: role === 'admin' ? 'premium_plus' : 'free',
      publishedBooksCount: role === 'author' ? 2 : 0,
      walletBalance: role === 'author' ? 450000 : 5000,
      phone: '+221 77 123 45 67',
      country: 'Sénégal',
      myLibraryBookIds: ['b1'],
      myAudiobookIds: ['b2'],
      bookmarkedPageByBookId: { b1: 12 },
      weeklyReadsCount: 1,
      totalReadsCount: 3
    }
  });
});

// API: Auth Register Endpoint
app.post("/api/auth/register", (req, res) => {
  const { name, email, phone, country } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: "Veuillez renseigner le nom et l'adresse email." });
  }

  res.json({
    success: true,
    token: `jwt_token_new_${Date.now()}`,
    user: {
      id: `usr_${Date.now()}`,
      name,
      email,
      role: 'reader',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      subscriptionTier: 'free',
      publishedBooksCount: 0,
      walletBalance: 0,
      phone: phone || '+221 77 000 00 00',
      country: country || 'Sénégal',
      myLibraryBookIds: [],
      myAudiobookIds: [],
      bookmarkedPageByBookId: {},
      weeklyReadsCount: 0,
      totalReadsCount: 0
    }
  });
});

// API: Books list & add
app.get("/api/books", (_req, res) => {
  res.json({ books: SERVER_BOOKS });
});

app.post("/api/books", (req, res) => {
  const newBook = req.body;
  if (!newBook.title) {
    return res.status(400).json({ error: "Titre requis" });
  }
  SERVER_BOOKS.unshift(newBook);
  res.json({ success: true, book: newBook });
});

// API: Categories list, create & delete
app.get("/api/categories", (_req, res) => {
  res.json({ categories: SERVER_CATEGORIES });
});

app.post("/api/categories", (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: "Le nom de la catégorie est obligatoire" });
  
  const newCat = {
    id: `cat_${Date.now()}`,
    name,
    description: description || 'Catégorie créée par l’administrateur',
    bookCount: 0
  };
  SERVER_CATEGORIES.push(newCat);
  res.json({ success: true, category: newCat });
});

app.delete("/api/categories/:id", (req, res) => {
  const { id } = req.params;
  SERVER_CATEGORIES = SERVER_CATEGORIES.filter(c => c.id !== id);
  res.json({ success: true, deletedId: id });
});

// API: Mobile Money & Card Payments
app.post("/api/payments/momo", (req, res) => {
  const { amount, phone, provider, userEmail, itemType } = req.body;
  if (!amount || !phone) {
    return res.status(400).json({ error: "Montant et numéro de téléphone requis pour le paiement Mobile Money" });
  }

  const transaction = {
    id: `tx_${Date.now()}`,
    user: userEmail || 'Client BookVerse',
    amount: Number(amount),
    method: `${provider || 'Orange Money'} (${phone})`,
    type: itemType || 'Abonnement / Achat Livre',
    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    status: 'succes'
  };

  SERVER_PAYMENTS.unshift(transaction);
  res.json({
    success: true,
    transactionId: transaction.id,
    message: `Paiement Mobile Money de ${amount.toLocaleString('fr-FR')} FCFA validé avec succès !`,
    transaction
  });
});

// API: AI Book Summarizer
app.post("/api/gemini/summarize", async (req, res) => {
  try {
    const { title, author, description, textSnippet } = req.body;
    const ai = getGeminiClient();

    const prompt = `Tu es l'assistant littéraire expert de la plateforme BookVerse.
Génère un résumé structuré et captivant en français pour l'ouvrage suivant :
Titre : "${title}"
Auteur : "${author}"
Description/Extrait : "${description || textSnippet || ""}"

Structure ta réponse au format JSON suivant :
{
  "summary": "Un résumé clair de 3-4 paragraphes captivants",
  "keyThemes": ["Thème 1", "Thème 2", "Thème 3"],
  "targetAudience": "À qui s'adresse principalement ce livre",
  "whyRead": "3 raisons clés de lire ce livre"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Error in /api/gemini/summarize:", error);
    res.status(500).json({
      error: error.message || "Erreur lors de la génération du résumé.",
    });
  }
});

// API: AI Reading Assistant
app.post("/api/gemini/assistant", async (req, res) => {
  try {
    const { bookTitle, author, question, contextText } = req.body;
    const ai = getGeminiClient();

    const prompt = `Tu es "Bookie", le Compagnon de Lecture IA pour BookVerse.
Tu réponds aux questions du lecteur sur le livre "${bookTitle}" de ${author}.
Contexte optionnel du livre ou du chapitre : "${contextText || ""}"
Question du lecteur : "${question}"

Réponds de façon bienveillante, érudite et claire en français, avec une mise en forme aérée.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    res.json({ answer: response.text });
  } catch (error: any) {
    console.error("Error in /api/gemini/assistant:", error);
    res.status(500).json({
      error: error.message || "Erreur lors de la réponse de l'assistant IA.",
    });
  }
});

// API: AI Book Recommendations
app.post("/api/gemini/recommendations", async (req, res) => {
  try {
    const { userPreferences, currentMood, favoriteGenres } = req.body;
    const ai = getGeminiClient();

    const prompt = `En tant qu'algorithme de recommandation littéraire de BookVerse (plateforme de livres africains et internationaux), recommande 3 idées de lectures uniques.
Préférences de l'utilisateur : ${userPreferences || "Littérature générale"}
Humeur actuelle : ${currentMood || "Curieux"}
Genres favoris : ${favoriteGenres ? favoriteGenres.join(", ") : "Divers"}

Renvoie un JSON structuré :
{
  "recommendations": [
    {
      "title": "Nom du livre suggéré",
      "author": "Nom de l'auteur",
      "genre": "Genre littéraire",
      "reason": "Pourquoi ce livre correspond parfaitement à la recherche",
      "vibe": "Ambiance du livre en 3 mots-clés"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Error in /api/gemini/recommendations:", error);
    res.status(500).json({
      error: error.message || "Erreur lors de la génération des recommandations.",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[BookVerse Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
