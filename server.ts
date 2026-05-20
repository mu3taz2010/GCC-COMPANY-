import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs, orderBy, query } from 'firebase/firestore';

dotenv.config();

// Firebase configuration fallback
const firebaseConfig = {
  apiKey: "AIzaSyDmzheFmFkOHXbRi-NjJ6RlvJpQhZddAfI",
  authDomain: "gcc-company.firebaseapp.com",
  projectId: "gcc-company",
  storageBucket: "gcc-company.firebasestorage.app",
  messagingSenderId: "953815562645",
  appId: "1:953815562645:web:5d7c9b409dc2105d9e5e9c",
  measurementId: "G-DS5Q3KJ0F5",
  firestoreDatabaseId: process.env.VITE_FIREBASE_FIRESTORE_DB_ID || "(default)"
};

const finalConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
  appId: process.env.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfig.measurementId,
  firestoreDatabaseId: process.env.VITE_FIREBASE_FIRESTORE_DB_ID || firebaseConfig.firestoreDatabaseId,
};

const fbApp = initializeApp(finalConfig);
const db = getFirestore(fbApp, finalConfig.firestoreDatabaseId);

let ai: GoogleGenAI | null = null;

function getAI() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. AI features will be disabled.");
      return null;
    }
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/settings/about", async (req, res) => {
    try {
      const snap = await getDoc(doc(db, 'settings', 'about'));
      if (snap.exists()) {
        res.json(snap.data());
      } else {
        res.status(404).json({ error: "Settings not found" });
      }
    } catch (error) {
      console.error("Firestore settings error:", error);
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.get("/api/projects", async (req, res) => {
    try {
      const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const projects = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(projects);
    } catch (error) {
      console.error("Firestore projects error:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.post("/api/contact", async (req, res) => {
    const { name, email, message, service } = req.body;
    console.log("Contact form submitted:", { name, email, message, service });
    res.json({ success: true, message: "Thank you for reaching out. We will get back to you soon." });
  });

  app.post("/api/consultant", async (req, res) => {
    const { prompt } = req.body;
    const aiClient = getAI();
    if (!aiClient) {
      return res.status(503).json({ error: "AI service is currently unavailable." });
    }
    try {
      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a professional engineering consultant for GCC Company. You help potential clients understand the benefits of firefighting systems, HVAC, generators, and alarms. You are helpful, professional, and knowledgeable. Answer in the same language as the user (Arabic or English).",
        },
      });
      res.json({ response: response.text });
    } catch (error) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: "Failed to get response from AI consultant." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  try {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

startServer();
