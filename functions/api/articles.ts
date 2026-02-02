import { z } from 'zod';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { eq, and, desc } from 'drizzle-orm';
import { getDB, type Env } from '../db';
import * as schema from '../../shared/schema';

// Helper to parse request body
async function parseBody(req: Request) {
  const contentType = req.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return await req.json();
  }
  if (contentType?.includes('application/x-www-form-urlencoded')) {
    const text = await req.text();
    const params = new URLSearchParams(text);
    return Object.fromEntries(params);
  }
  return {};
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle CORS preflight
function handleCORS() {
  return new Response(null, { headers: corsHeaders });
}

// Articles API
export async function onRequest(context: { request: Request; env: Env; params: Record<string, string> }) {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const method = request.method;
  const path = url.pathname;

  // Handle CORS
  if (method === 'OPTIONS') {
    return handleCORS();
  }

  const db = getDB(env);

  try {
    // POST /api/articles - Ingest new article
    if (path === '/api/articles' && method === 'POST') {
      const body = await parseBody(request);
      const { url: articleUrl } = body;

      if (!articleUrl || typeof articleUrl !== 'string') {
        return new Response(JSON.stringify({ message: 'URL is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      try {
        // Check if article already exists
        const existingArticle = await db.select()
          .from(schema.articles)
          .where(eq(schema.articles.url, articleUrl))
          .limit(1);

        let article;
        if (existingArticle.length === 0) {
          // Fetch and parse article
          const response = await fetch(articleUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; Reader/1.0)',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            },
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status}`);
          }

          const html = await response.text();
          const doc = new JSDOM(html, { url: articleUrl });
          const reader = new Readability(doc.window.document);
          const parsed = reader.parse();

          const title = parsed?.title || doc.window.document.querySelector('title')?.textContent || 'Untitled';
          const content = parsed?.content || `<div>${html}</div>`;
          const textContent = parsed?.textContent || '';

          // Insert article
          const inserted = await db.insert(schema.articles)
            .values({
              url: articleUrl,
              title: title.trim(),
              author: parsed?.byline || null,
              domain: new URL(articleUrl).hostname,
              contentRaw: html,
              contentClean: content,
              textContent,
              wordCount: textContent.split(/\s+/).filter(Boolean).length,
              publishedDate: new Date(),
            })
            .returning();
          
          article = inserted[0];
        } else {
          article = existingArticle[0];
        }

        // TODO: Add to user library (requires auth)
        return new Response(JSON.stringify({
          ...article,
          libraryId: null,
          status: 'inbox',
          isFavorite: false,
          readProgress: 0,
          savedAt: new Date().toISOString(),
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      } catch (error: any) {
        return new Response(JSON.stringify({ message: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    // GET /api/articles - List articles
    if (path === '/api/articles' && method === 'GET') {
      const articles = await db.select()
        .from(schema.articles)
        .orderBy(desc(schema.articles.publishedDate))
        .limit(50);

      const result = articles.map(article => ({
        ...article,
        libraryId: null,
        status: 'inbox',
        isFavorite: false,
        readProgress: 0,
        savedAt: article.publishedDate,
      }));

      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // GET /api/articles/:id - Get single article
    const articleMatch = path.match(/^\/api\/articles\/(\d+)$/);
    if (articleMatch && method === 'GET') {
      const articleId = parseInt(articleMatch[1]);
      
      const articles = await db.select()
        .from(schema.articles)
        .where(eq(schema.articles.id, articleId))
        .limit(1);

      if (articles.length === 0) {
        return new Response(JSON.stringify({ message: 'Article not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const article = articles[0];
      return new Response(JSON.stringify({
        ...article,
        libraryId: null,
        status: 'inbox',
        isFavorite: false,
        readProgress: 0,
        savedAt: article.publishedDate,
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // 404 for unknown routes
    return new Response(JSON.stringify({ message: 'Not Found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    console.error('Articles API error:', error);
    return new Response(JSON.stringify({ message: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}
