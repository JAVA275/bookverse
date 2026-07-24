import { Router } from "express";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { requireAuth } from "../middlewares/auth.middleware";
import { aiRateLimiter } from "../middlewares/rateLimit.middleware";

export const geminiRouter = Router();

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("La clé d'API GEMINI_API_KEY n'est pas configurée.");
  }
  return new GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "bookverse-backend" } } });
}

// SÉCURITÉ / COÛTS: ces routes appellent une API IA payante au token. Sans authentification
// et sans limite de taille sur les entrées, n'importe qui pouvait envoyer des textes énormes
// en boucle et épuiser le budget Gemini (déni de service financier). On ajoute donc une
// validation stricte (Zod, longueurs plafonnées) et un rate limiter dédié en plus de requireAuth.
geminiRouter.use(requireAuth, aiRateLimiter);

const summarizeSchema = z.object({
  title: z.string().min(1).max(300),
  author: z.string().min(1).max(200),
  description: z.string().max(4000).optional(),
  textSnippet: z.string().max(4000).optional(),
});

const assistantSchema = z.object({
  bookTitle: z.string().min(1).max(300),
  author: z.string().min(1).max(200),
  question: z.string().min(1).max(1000),
  contextText: z.string().max(4000).optional(),
});

const recommendationsSchema = z.object({
  userPreferences: z.string().max(1000).optional(),
  currentMood: z.string().max(200).optional(),
  favoriteGenres: z.array(z.string().max(100)).max(20).optional(),
});

// Résumé structuré + thèmes clés d'un livre
geminiRouter.post("/summarize", async (req, res) => {
  try {
    const { title, author, description, textSnippet } = summarizeSchema.parse(req.body);
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
      config: { responseMimeType: "application/json" },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Error in /api/gemini/summarize:", error);
    res.status(500).json({ error: error.message || "Erreur lors de la génération du résumé." });
  }
});

// Assistant de lecture conversationnel ("Bookie")
geminiRouter.post("/assistant", async (req, res) => {
  try {
    const { bookTitle, author, question, contextText } = assistantSchema.parse(req.body);
    const ai = getGeminiClient();

    const prompt = `Tu es "Bookie", le Compagnon de Lecture IA pour BookVerse.
Tu réponds aux questions du lecteur sur le livre "${bookTitle}" de ${author}.
Contexte optionnel du livre ou du chapitre : "${contextText || ""}"
Question du lecteur : "${question}"

Réponds de façon bienveillante, érudite et claire en français, avec une mise en forme aérée.`;

    const response = await ai.models.generateContent({ model: "gemini-3.6-flash", contents: prompt });
    res.json({ answer: response.text });
  } catch (error: any) {
    console.error("Error in /api/gemini/assistant:", error);
    res.status(500).json({ error: error.message || "Erreur lors de la réponse de l'assistant IA." });
  }
});

// Recommandations de lecture personnalisées
geminiRouter.post("/recommendations", async (req, res) => {
  try {
    const { userPreferences, currentMood, favoriteGenres } = recommendationsSchema.parse(req.body);
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
      config: { responseMimeType: "application/json" },
    });

    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Error in /api/gemini/recommendations:", error);
    res.status(500).json({ error: error.message || "Erreur lors de la génération des recommandations." });
  }
});
