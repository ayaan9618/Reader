import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up authentication (passport)
  setupAuth(app);

  // Helper middleware to ensure authenticated
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: "Unauthorized" });
  };

  // === ARTICLES ===

  app.post(api.articles.ingest.path, requireAuth, async (req, res) => {
    try {
      const { url } = api.articles.ingest.input.parse(req.body);
      const userId = req.user!.id;

      // 1. Check if article exists
      let article = await storage.getArticleByUrl(url);

      if (!article) {
        // 2. Fetch and parse
        try {
          const response = await fetch(url);
          const html = await response.text();
          const doc = new JSDOM(html, { url });
          const reader = new Readability(doc.window.document);
          const parsed = reader.parse();

          if (!parsed) {
            return res.status(400).json({ message: "Could not parse article content" });
          }

          article = await storage.createArticle({
            url,
            title: parsed.title || "Untitled",
            author: parsed.byline,
            domain: new URL(url).hostname,
            contentRaw: html,
            contentClean: parsed.content, // HTML content
            textContent: parsed.textContent, // Plain text for TTS
            wordCount: parsed.textContent.split(/\s+/).length,
            publishedDate: new Date(), // Approximate
          });
        } catch (fetchError) {
          console.error("Fetch error:", fetchError);
          return res.status(500).json({ message: "Failed to fetch URL" });
        }
      }

      // 3. Add to user library if not already
      let libraryItem = await storage.getLibraryItem(userId, article.id);
      if (!libraryItem) {
        libraryItem = await storage.addToLibrary(userId, article.id);
      }

      res.status(201).json({ ...libraryItem, article });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.get(api.articles.list.path, requireAuth, async (req, res) => {
    const userId = req.user!.id;
    let items = await storage.getLibrary(userId);
    
    // Handle filtering (in memory or move to DB)
    const status = req.query.status as string;
    const search = req.query.search as string;

    if (status) {
      items = items.filter(i => i.status === status);
    }
    if (search) {
      const lowerSearch = search.toLowerCase();
      items = items.filter(i => i.title.toLowerCase().includes(lowerSearch));
    }

    res.json(items);
  });

  app.get(api.articles.get.path, requireAuth, async (req, res) => {
    const userId = req.user!.id;
    const libraryItem = await storage.getLibraryItem(userId, parseInt(req.params.id));
    
    if (!libraryItem) {
      // Check if it's just an article without library entry (shouldn't happen in this flow usually)
      return res.status(404).json({ message: "Article not found in library" });
    }

    const article = await storage.getUser(userId).then(async () => {
        // We know the item exists, now get full article data + library data
        // For MVP, getLibrary(userId) returns joined data, let's filter just one
        // Ideally we add getLibraryItemWithArticle to storage
        const all = await storage.getLibrary(userId);
        return all.find(i => i.libraryId === libraryItem.id);
    });

    if (!article) return res.status(404).json({ message: "Article not found" });
    res.json(article);
  });

  app.patch(api.articles.updateStatus.path, requireAuth, async (req, res) => {
    const userId = req.user!.id;
    // req.params.id is the ARTICLE ID based on route definition? 
    // Wait, route is /api/articles/:id, usually refers to resource ID. 
    // In library, it could be library ID or article ID.
    // Let's assume params.id is ARTICLE ID for consistency with "get article".
    
    const articleId = parseInt(req.params.id);
    const libraryItem = await storage.getLibraryItem(userId, articleId);

    if (!libraryItem) return res.status(404).json({ message: "Article not in library" });

    const updates = api.articles.updateStatus.input.parse(req.body);
    const updated = await storage.updateLibraryStatus(libraryItem.id, updates);
    res.json(updated);
  });

  app.delete(api.articles.delete.path, requireAuth, async (req, res) => {
    const userId = req.user!.id;
    const articleId = parseInt(req.params.id);
    const libraryItem = await storage.getLibraryItem(userId, articleId);
    
    if (libraryItem) {
      await storage.removeFromLibrary(libraryItem.id);
    }
    res.status(204).send();
  });

  // === HIGHLIGHTS ===

  app.get(api.highlights.list.path, requireAuth, async (req, res) => {
    const userId = req.user!.id;
    const highlights = await storage.getHighlights(userId);
    res.json(highlights);
  });

  app.post(api.highlights.create.path, requireAuth, async (req, res) => {
    const userId = req.user!.id;
    const input = api.highlights.create.input.parse(req.body);
    const highlight = await storage.createHighlight({ ...input, userId });
    res.status(201).json(highlight);
  });

  app.delete(api.highlights.delete.path, requireAuth, async (req, res) => {
    const userId = req.user!.id;
    await storage.deleteHighlight(parseInt(req.params.id), userId);
    res.status(204).send();
  });

  // === NOTES ===

  app.get(api.notes.list.path, requireAuth, async (req, res) => {
    const userId = req.user!.id;
    const notes = await storage.getNotes(userId, parseInt(req.params.id));
    res.json(notes);
  });

  app.post(api.notes.create.path, requireAuth, async (req, res) => {
    const userId = req.user!.id;
    const input = api.notes.create.input.parse(req.body);
    const note = await storage.createNote({ ...input, userId });
    res.status(201).json(note);
  });

  return httpServer;
}
