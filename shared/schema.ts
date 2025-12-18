import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  avatar: text("avatar"),
  isAdmin: boolean("is_admin").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Manga/Series table
export const series = pgTable("series", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  coverImage: text("cover_image"),
  author: text("author"),
  artist: text("artist"),
  genres: text("genres").array(),
  status: text("status").default("ongoing"), // ongoing, completed, hiatus
  rating: integer("rating").default(0),
  views: integer("views").default(0),
  isFeatured: boolean("is_featured").default(false),
  isTrending: boolean("is_trending").default(false),
});

export const insertSeriesSchema = createInsertSchema(series).omit({
  id: true,
});

export type InsertSeries = z.infer<typeof insertSeriesSchema>;
export type Series = typeof series.$inferSelect;

// Chapters table
export const chapters = pgTable("chapters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  seriesId: varchar("series_id").notNull(),
  chapterNumber: integer("chapter_number").notNull(),
  title: text("title"),
  pages: text("pages").array(), // Array of image URLs
  releaseDate: text("release_date"),
});

export const insertChapterSchema = createInsertSchema(chapters).omit({
  id: true,
});

export type InsertChapter = z.infer<typeof insertChapterSchema>;
export type Chapter = typeof chapters.$inferSelect;

// User favorites
export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  seriesId: varchar("series_id").notNull(),
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
});

export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;
export type Favorite = typeof favorites.$inferSelect;

// Reading progress
export const readingProgress = pgTable("reading_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  seriesId: varchar("series_id").notNull(),
  chapterId: varchar("chapter_id").notNull(),
  currentPage: integer("current_page").default(0),
  lastRead: text("last_read"),
});

export const insertReadingProgressSchema = createInsertSchema(readingProgress).omit({
  id: true,
});

export type InsertReadingProgress = z.infer<typeof insertReadingProgressSchema>;
export type ReadingProgress = typeof readingProgress.$inferSelect;

// Search filters type (frontend only)
export interface SearchFilters {
  query: string;
  genres: string[];
  status: "all" | "ongoing" | "completed" | "hiatus";
}

// Available genres
export const GENRES = [
  "Action",
  "Adventure", 
  "Comedy",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Slice of Life",
  "Sports",
  "Supernatural",
  "Thriller",
] as const;

export type Genre = typeof GENRES[number];
