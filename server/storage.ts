import { db } from "./db";
import { 
  users, articles, userLibrary, highlights, notes,
  type User, type InsertUser, 
  type Article, type InsertArticle,
  type LibraryItem,
  type Highlight, type Note
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;
  // User
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Articles & Library
  getArticleByUrl(url: string): Promise<Article | undefined>;
  createArticle(article: InsertArticle): Promise<Article>;
  getLibrary(userId: number): Promise<(Article & { libraryId: number, status: string, isFavorite: boolean, readProgress: number, savedAt: string | null })[]>;
  getLibraryItem(userId: number, articleId: number): Promise<LibraryItem | undefined>;
  addToLibrary(userId: number, articleId: number): Promise<LibraryItem>;
  updateLibraryStatus(id: number, updates: Partial<LibraryItem>): Promise<LibraryItem>;
  removeFromLibrary(id: number): Promise<void>;

  // Highlights
  getHighlights(userId: number): Promise<(Highlight & { articleTitle: string })[]>;
  createHighlight(highlight: Omit<Highlight, "id" | "createdAt">): Promise<Highlight>;
  deleteHighlight(id: number, userId: number): Promise<void>;

  // Notes
  getNotes(userId: number, articleId: number): Promise<Note[]>;
  createNote(note: Omit<Note, "id" | "createdAt">): Promise<Note>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Articles
  async getArticleByUrl(url: string): Promise<Article | undefined> {
    const [article] = await db.select().from(articles).where(eq(articles.url, url));
    return article;
  }

  async createArticle(insertArticle: InsertArticle): Promise<Article> {
    const [article] = await db.insert(articles).values(insertArticle).returning();
    return article;
  }

  async getLibrary(userId: number): Promise<(Article & { libraryId: number, status: string, isFavorite: boolean, readProgress: number, savedAt: string | null })[]> {
    const result = await db
      .select({
        // Spread article fields manually since Drizzle spread is tricky in joins sometimes, 
        // or just select all from articles
        id: articles.id,
        url: articles.url,
        title: articles.title,
        author: articles.author,
        domain: articles.domain,
        contentRaw: articles.contentRaw,
        contentClean: articles.contentClean,
        textContent: articles.textContent,
        wordCount: articles.wordCount,
        publishedDate: articles.publishedDate,
        createdAt: articles.createdAt,
        // Library specific
        libraryId: userLibrary.id,
        status: userLibrary.status,
        isFavorite: userLibrary.isFavorite,
        readProgress: userLibrary.readProgress,
        savedAt: userLibrary.savedAt,
      })
      .from(userLibrary)
      .innerJoin(articles, eq(userLibrary.articleId, articles.id))
      .where(eq(userLibrary.userId, userId))
      .orderBy(desc(userLibrary.savedAt));
    
    // Cast dates to string to match inferred type for now if needed, or rely on Driver
    return result.map(r => ({
      ...r,
      savedAt: r.savedAt ? r.savedAt.toISOString() : null,
      publishedDate: r.publishedDate ? r.publishedDate : null
    }));
  }

  async getLibraryItem(userId: number, articleId: number): Promise<LibraryItem | undefined> {
    const [item] = await db.select()
      .from(userLibrary)
      .where(and(eq(userLibrary.userId, userId), eq(userLibrary.articleId, articleId)));
    return item;
  }

  async addToLibrary(userId: number, articleId: number): Promise<LibraryItem> {
    const [item] = await db.insert(userLibrary)
      .values({ userId, articleId, status: "inbox" })
      .returning();
    return item;
  }

  async updateLibraryStatus(id: number, updates: Partial<LibraryItem>): Promise<LibraryItem> {
    const [item] = await db.update(userLibrary)
      .set(updates)
      .where(eq(userLibrary.id, id))
      .returning();
    return item;
  }

  async removeFromLibrary(id: number): Promise<void> {
    await db.delete(userLibrary).where(eq(userLibrary.id, id));
  }

  // Highlights
  async getHighlights(userId: number): Promise<(Highlight & { articleTitle: string })[]> {
    return db.select({
      id: highlights.id,
      userId: highlights.userId,
      articleId: highlights.articleId,
      textContent: highlights.textContent,
      note: highlights.note,
      colorHex: highlights.colorHex,
      cfiRange: highlights.cfiRange,
      createdAt: highlights.createdAt,
      articleTitle: articles.title
    })
    .from(highlights)
    .innerJoin(articles, eq(highlights.articleId, articles.id))
    .where(eq(highlights.userId, userId))
    .orderBy(desc(highlights.createdAt));
  }

  async createHighlight(highlight: Omit<Highlight, "id" | "createdAt">): Promise<Highlight> {
    const [h] = await db.insert(highlights).values(highlight).returning();
    return h;
  }

  async deleteHighlight(id: number, userId: number): Promise<void> {
    await db.delete(highlights).where(and(eq(highlights.id, id), eq(highlights.userId, userId)));
  }

  // Notes
  async getNotes(userId: number, articleId: number): Promise<Note[]> {
    return db.select()
      .from(notes)
      .where(and(eq(notes.userId, userId), eq(notes.articleId, articleId)))
      .orderBy(desc(notes.createdAt));
  }

  async createNote(note: Omit<Note, "id" | "createdAt">): Promise<Note> {
    const [n] = await db.insert(notes).values(note).returning();
    return n;
  }
}

export const storage = new DatabaseStorage();
