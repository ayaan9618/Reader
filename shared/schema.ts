import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(), // Using as email
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const articles = pgTable("articles", {
  id: serial("id").primaryKey(),
  url: text("url").notNull().unique(),
  title: text("title").notNull(),
  author: text("author"),
  domain: text("domain"),
  contentRaw: text("content_raw"),
  contentClean: text("content_clean"),
  textContent: text("text_content"), // Pure text for TTS
  wordCount: integer("word_count"),
  publishedDate: timestamp("published_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userLibrary = pgTable("user_library", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  articleId: integer("article_id").notNull(),
  status: text("status").notNull().default("inbox"), // inbox, queue, archive
  isFavorite: boolean("is_favorite").default(false),
  readProgress: real("read_progress").default(0), // 0.0 to 1.0
  savedAt: timestamp("saved_at").defaultNow(),
});

export const highlights = pgTable("highlights", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  articleId: integer("article_id").notNull(),
  textContent: text("text_content").notNull(),
  note: text("note"),
  colorHex: text("color_hex").default("#FFFF00"),
  cfiRange: text("cfi_range"), // DOM range selector or similar identifier
  createdAt: timestamp("created_at").defaultNow(),
});

export const notes = pgTable("notes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  articleId: integer("article_id").notNull(),
  noteText: text("note_text").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const userRelations = relations(users, ({ many }) => ({
  library: many(userLibrary),
  highlights: many(highlights),
  notes: many(notes),
}));

export const articleRelations = relations(articles, ({ many }) => ({
  savedBy: many(userLibrary),
  highlights: many(highlights),
  notes: many(notes),
}));

export const userLibraryRelations = relations(userLibrary, ({ one }) => ({
  user: one(users, {
    fields: [userLibrary.userId],
    references: [users.id],
  }),
  article: one(articles, {
    fields: [userLibrary.articleId],
    references: [articles.id],
  }),
}));

export const highlightRelations = relations(highlights, ({ one }) => ({
  user: one(users, {
    fields: [highlights.userId],
    references: [users.id],
  }),
  article: one(articles, {
    fields: [highlights.articleId],
    references: [articles.id],
  }),
}));

export const noteRelations = relations(notes, ({ one }) => ({
  user: one(users, {
    fields: [notes.userId],
    references: [users.id],
  }),
  article: one(articles, {
    fields: [notes.articleId],
    references: [articles.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertArticleSchema = createInsertSchema(articles).omit({ id: true, createdAt: true });
export const insertLibraryItemSchema = createInsertSchema(userLibrary).omit({ id: true, savedAt: true });
export const insertHighlightSchema = createInsertSchema(highlights).omit({ id: true, createdAt: true });
export const insertNoteSchema = createInsertSchema(notes).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===

export type User = typeof users.$inferSelect;
export type Article = typeof articles.$inferSelect;
export type LibraryItem = typeof userLibrary.$inferSelect;
export type Highlight = typeof highlights.$inferSelect;
export type Note = typeof notes.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertArticle = z.infer<typeof insertArticleSchema>;

// Joined type for frontend display
export type LibraryArticle = Article & {
  libraryId: number;
  status: string;
  isFavorite: boolean;
  readProgress: number;
  savedAt: string | null;
};

// Request types
export type CreateArticleRequest = { url: string }; // We fetch content on backend
export type UpdateLibraryItemRequest = Partial<z.infer<typeof insertLibraryItemSchema>>;
export type CreateHighlightRequest = z.infer<typeof insertHighlightSchema>;
export type CreateNoteRequest = z.infer<typeof insertNoteSchema>;
