import { 
  type User, type InsertUser,
  type Series, type InsertSeries,
  type Chapter, type InsertChapter,
  type Favorite, type InsertFavorite,
  type ReadingProgress, type InsertReadingProgress
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Series
  getAllSeries(): Promise<Series[]>;
  getSeries(id: string): Promise<Series | undefined>;
  createSeries(series: InsertSeries): Promise<Series>;
  updateSeries(id: string, series: Partial<InsertSeries>): Promise<Series | undefined>;
  deleteSeries(id: string): Promise<boolean>;
  
  // Chapters
  getChaptersBySeriesId(seriesId: string): Promise<Chapter[]>;
  getChapter(id: string): Promise<Chapter | undefined>;
  createChapter(chapter: InsertChapter): Promise<Chapter>;
  updateChapter(id: string, chapter: Partial<InsertChapter>): Promise<Chapter | undefined>;
  deleteChapter(id: string): Promise<boolean>;
  
  // Favorites
  getFavoritesByUserId(userId: string): Promise<Favorite[]>;
  addFavorite(favorite: InsertFavorite): Promise<Favorite>;
  removeFavorite(userId: string, seriesId: string): Promise<boolean>;
  
  // Reading Progress
  getReadingProgressByUserId(userId: string): Promise<ReadingProgress[]>;
  getReadingProgress(userId: string, seriesId: string): Promise<ReadingProgress | undefined>;
  upsertReadingProgress(progress: InsertReadingProgress): Promise<ReadingProgress>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private series: Map<string, Series>;
  private chapters: Map<string, Chapter>;
  private favorites: Map<string, Favorite>;
  private readingProgress: Map<string, ReadingProgress>;

  constructor() {
    this.users = new Map();
    this.series = new Map();
    this.chapters = new Map();
    this.favorites = new Map();
    this.readingProgress = new Map();
    
    // Add demo admin user
    const adminUser: User = {
      id: "admin-1",
      username: "admin",
      password: "admin123",
      email: "admin@noctoon.com",
      avatar: null,
      isAdmin: true,
    };
    this.users.set(adminUser.id, adminUser);
    
    // Add demo series data
    this.initDemoData();
  }

  private initDemoData() {
    const demoSeries: Series[] = [
      {
        id: "series-1",
        title: "Solo Leveling",
        description: "10 yıl önce 'Gate' denilen başka boyutlara açılan kapılar ortaya çıktı. Avcılar bu kapılardan geçerek canavarları avlıyor. Sung Jin-Woo, E-Rank avcı olarak hayatta kalmaya çalışırken gizemli bir sistem tarafından seçilir.",
        coverImage: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=600&fit=crop",
        author: "Chugong",
        artist: "DUBU",
        genres: ["Action", "Fantasy", "Adventure"],
        status: "completed",
        rating: 95,
        views: 1250000,
        isFeatured: true,
        isTrending: true,
      },
      {
        id: "series-2",
        title: "Tower of God",
        description: "Bam, hayatını kurtaran kız Rachel'ı takip etmek için gizemli Kule'ye girer. Kule'nin zirvesine ulaşmak için sayısız sınavdan geçmesi ve güçlü düşmanlarla savaşması gerekecek.",
        coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&h=600&fit=crop",
        author: "SIU",
        artist: "SIU",
        genres: ["Action", "Fantasy", "Mystery"],
        status: "ongoing",
        rating: 92,
        views: 980000,
        isFeatured: true,
        isTrending: true,
      },
      {
        id: "series-3",
        title: "The Beginning After The End",
        description: "Güçlü bir kral olarak ölen Arthur Leywin, sihirli bir dünyada yeniden doğar. Geçmiş yaşamının tüm anılarını koruyarak bu yeni dünyada büyümeye başlar.",
        coverImage: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&h=600&fit=crop",
        author: "TurtleMe",
        artist: "Fuyuki23",
        genres: ["Fantasy", "Action", "Adventure"],
        status: "ongoing",
        rating: 94,
        views: 850000,
        isFeatured: true,
        isTrending: false,
      },
      {
        id: "series-4",
        title: "Omniscient Reader's Viewpoint",
        description: "Kim Dokja, favori web romanı gerçek olunca kendini hikayenin içinde bulur. Romanın tek okuyu­cusu olarak bildiği tüm bilgileri kullanarak hayatta kalmaya çalışır.",
        coverImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop",
        author: "Sing Shong",
        artist: "Sleepy-C",
        genres: ["Action", "Fantasy", "Drama"],
        status: "ongoing",
        rating: 96,
        views: 720000,
        isFeatured: false,
        isTrending: true,
      },
      {
        id: "series-5",
        title: "Eleceed",
        description: "Kedi sever genç Jiwoo, güçlü bir uyanmış olan Kayden'la tanışır. Kayden bir kedi bedeninde sıkışmıştır ve Jiwoo'yu eğiterek onu güçlü bir savaşçı yapmaya karar verir.",
        coverImage: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=600&fit=crop",
        author: "Son Jeho",
        artist: "ZHENA",
        genres: ["Action", "Comedy", "Supernatural"],
        status: "ongoing",
        rating: 91,
        views: 650000,
        isFeatured: false,
        isTrending: true,
      },
      {
        id: "series-6",
        title: "True Beauty",
        description: "Lise öğrencisi Jugyeong, makyaj yaparak kendini tamamen farklı birine dönüştürür. Ama gerçek yüzünü bilen tek kişi sınıf arkadaşı Suho'dur.",
        coverImage: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&h=600&fit=crop",
        author: "Yaongyi",
        artist: "Yaongyi",
        genres: ["Romance", "Comedy", "Drama"],
        status: "completed",
        rating: 88,
        views: 920000,
        isFeatured: false,
        isTrending: false,
      },
      {
        id: "series-7",
        title: "The God of High School",
        description: "Kore genelinde en güçlü lise öğrencisini belirlemek için bir dövüş turnuvası düzenlenir. Ancak bu turnuvanın arkasında çok daha büyük güçler ve planlar gizlidir.",
        coverImage: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop",
        author: "Park Yongje",
        artist: "Park Yongje",
        genres: ["Action", "Comedy", "Supernatural"],
        status: "ongoing",
        rating: 89,
        views: 780000,
        isFeatured: true,
        isTrending: false,
      },
      {
        id: "series-8",
        title: "Noblesse",
        description: "820 yıllık uykusundan uyanan asil vampir Rai, modern dünyada hayata adapte olmaya çalışır. Sadık hizmetkarı Frankenstein'ın yönettiği bir okula girer.",
        coverImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop",
        author: "Son Jeho",
        artist: "Lee Kwangsu",
        genres: ["Action", "Supernatural", "Comedy"],
        status: "completed",
        rating: 90,
        views: 1100000,
        isFeatured: false,
        isTrending: false,
      },
    ];

    demoSeries.forEach(s => this.series.set(s.id, s));

    // Add demo chapters for first series
    const demoChapters: Chapter[] = [
      { id: "ch-1", seriesId: "series-1", chapterNumber: 1, title: "Uyanış", pages: [
        "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=1200&fit=crop",
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=1200&fit=crop",
        "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&h=1200&fit=crop",
      ], releaseDate: "2024-01-01" },
      { id: "ch-2", seriesId: "series-1", chapterNumber: 2, title: "Sistem", pages: [
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=1200&fit=crop",
        "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=800&h=1200&fit=crop",
      ], releaseDate: "2024-01-08" },
      { id: "ch-3", seriesId: "series-1", chapterNumber: 3, title: "İlk Görev", pages: [
        "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=800&h=1200&fit=crop",
      ], releaseDate: "2024-01-15" },
      { id: "ch-4", seriesId: "series-2", chapterNumber: 1, title: "Kule", pages: [
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=1200&fit=crop",
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&h=1200&fit=crop",
      ], releaseDate: "2024-01-01" },
      { id: "ch-5", seriesId: "series-2", chapterNumber: 2, title: "Sınav", pages: [
        "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&h=1200&fit=crop",
      ], releaseDate: "2024-01-08" },
    ];

    demoChapters.forEach(ch => this.chapters.set(ch.id, ch));
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id, avatar: null, isAdmin: false };
    this.users.set(id, user);
    return user;
  }

  // Series
  async getAllSeries(): Promise<Series[]> {
    return Array.from(this.series.values());
  }

  async getSeries(id: string): Promise<Series | undefined> {
    return this.series.get(id);
  }

  async createSeries(insertSeries: InsertSeries): Promise<Series> {
    const id = randomUUID();
    const series: Series = { 
      ...insertSeries, 
      id,
      rating: 0,
      views: 0,
    };
    this.series.set(id, series);
    return series;
  }

  async updateSeries(id: string, updates: Partial<InsertSeries>): Promise<Series | undefined> {
    const existing = this.series.get(id);
    if (!existing) return undefined;
    
    const updated: Series = { ...existing, ...updates };
    this.series.set(id, updated);
    return updated;
  }

  async deleteSeries(id: string): Promise<boolean> {
    return this.series.delete(id);
  }

  // Chapters
  async getChaptersBySeriesId(seriesId: string): Promise<Chapter[]> {
    return Array.from(this.chapters.values()).filter(
      (chapter) => chapter.seriesId === seriesId
    );
  }

  async getChapter(id: string): Promise<Chapter | undefined> {
    return this.chapters.get(id);
  }

  async createChapter(insertChapter: InsertChapter): Promise<Chapter> {
    const id = randomUUID();
    const chapter: Chapter = { ...insertChapter, id };
    this.chapters.set(id, chapter);
    return chapter;
  }

  async updateChapter(id: string, updates: Partial<InsertChapter>): Promise<Chapter | undefined> {
    const existing = this.chapters.get(id);
    if (!existing) return undefined;
    
    const updated: Chapter = { ...existing, ...updates };
    this.chapters.set(id, updated);
    return updated;
  }

  async deleteChapter(id: string): Promise<boolean> {
    return this.chapters.delete(id);
  }

  // Favorites
  async getFavoritesByUserId(userId: string): Promise<Favorite[]> {
    return Array.from(this.favorites.values()).filter(
      (fav) => fav.userId === userId
    );
  }

  async addFavorite(insertFavorite: InsertFavorite): Promise<Favorite> {
    const id = randomUUID();
    const favorite: Favorite = { ...insertFavorite, id };
    this.favorites.set(id, favorite);
    return favorite;
  }

  async removeFavorite(userId: string, seriesId: string): Promise<boolean> {
    const favorite = Array.from(this.favorites.values()).find(
      (fav) => fav.userId === userId && fav.seriesId === seriesId
    );
    if (favorite) {
      return this.favorites.delete(favorite.id);
    }
    return false;
  }

  // Reading Progress
  async getReadingProgressByUserId(userId: string): Promise<ReadingProgress[]> {
    return Array.from(this.readingProgress.values()).filter(
      (progress) => progress.userId === userId
    );
  }

  async getReadingProgress(userId: string, seriesId: string): Promise<ReadingProgress | undefined> {
    return Array.from(this.readingProgress.values()).find(
      (progress) => progress.userId === userId && progress.seriesId === seriesId
    );
  }

  async upsertReadingProgress(insertProgress: InsertReadingProgress): Promise<ReadingProgress> {
    const existing = await this.getReadingProgress(insertProgress.userId, insertProgress.seriesId);
    
    if (existing) {
      const updated: ReadingProgress = { ...existing, ...insertProgress };
      this.readingProgress.set(existing.id, updated);
      return updated;
    }
    
    const id = randomUUID();
    const progress: ReadingProgress = { ...insertProgress, id };
    this.readingProgress.set(id, progress);
    return progress;
  }
}

export const storage = new MemStorage();
