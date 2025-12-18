import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertSeriesSchema, insertChapterSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const parsed = insertUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid data" });
      }

      const existingUser = await storage.getUserByUsername(parsed.data.username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const user = await storage.createUser(parsed.data);
      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Series Routes
  app.get("/api/series", async (req, res) => {
    try {
      const series = await storage.getAllSeries();
      res.json(series);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/series/:id", async (req, res) => {
    try {
      const series = await storage.getSeries(req.params.id);
      if (!series) {
        return res.status(404).json({ error: "Series not found" });
      }
      res.json(series);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/series", async (req, res) => {
    try {
      const parsed = insertSeriesSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid data", details: parsed.error });
      }

      const series = await storage.createSeries(parsed.data);
      res.status(201).json(series);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.patch("/api/series/:id", async (req, res) => {
    try {
      const series = await storage.updateSeries(req.params.id, req.body);
      if (!series) {
        return res.status(404).json({ error: "Series not found" });
      }
      res.json(series);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.delete("/api/series/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSeries(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Series not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Chapters Routes
  app.get("/api/series/:seriesId/chapters", async (req, res) => {
    try {
      const chapters = await storage.getChaptersBySeriesId(req.params.seriesId);
      res.json(chapters);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.get("/api/chapters/:id", async (req, res) => {
    try {
      const chapter = await storage.getChapter(req.params.id);
      if (!chapter) {
        return res.status(404).json({ error: "Chapter not found" });
      }
      res.json(chapter);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/chapters", async (req, res) => {
    try {
      const parsed = insertChapterSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid data" });
      }

      const chapter = await storage.createChapter(parsed.data);
      res.status(201).json(chapter);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.patch("/api/chapters/:id", async (req, res) => {
    try {
      const chapter = await storage.updateChapter(req.params.id, req.body);
      if (!chapter) {
        return res.status(404).json({ error: "Chapter not found" });
      }
      res.json(chapter);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.delete("/api/chapters/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteChapter(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Chapter not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Favorites Routes
  app.get("/api/favorites", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.json([]);
      }
      const favorites = await storage.getFavoritesByUserId(userId);
      res.json(favorites);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const { userId, seriesId } = req.body;
      if (!userId || !seriesId) {
        return res.status(400).json({ error: "userId and seriesId required" });
      }

      const favorite = await storage.addFavorite({ userId, seriesId });
      res.status(201).json(favorite);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.delete("/api/favorites/:seriesId", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ error: "userId required" });
      }

      const deleted = await storage.removeFavorite(userId, req.params.seriesId);
      if (!deleted) {
        return res.status(404).json({ error: "Favorite not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  // Reading Progress Routes
  app.get("/api/reading-progress", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.json([]);
      }
      const progress = await storage.getReadingProgressByUserId(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  app.post("/api/reading-progress", async (req, res) => {
    try {
      const { userId, seriesId, chapterId, currentPage } = req.body;
      if (!userId || !seriesId || !chapterId) {
        return res.status(400).json({ error: "Required fields missing" });
      }

      const progress = await storage.upsertReadingProgress({
        userId,
        seriesId,
        chapterId,
        currentPage: currentPage || 0,
        lastRead: new Date().toISOString(),
      });
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Server error" });
    }
  });

  return httpServer;
}
