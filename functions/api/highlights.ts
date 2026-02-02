import { z } from 'zod';
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

// Highlights API
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
    // GET /api/highlights - List highlights
    if (path === '/api/highlights' && method === 'GET') {
      // TODO: Filter by user when auth is implemented
      const highlights = await db.select()
        .from(schema.highlights)
        .orderBy(desc(schema.highlights.createdAt))
        .limit(50);

      return new Response(JSON.stringify(highlights), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // POST /api/highlights - Create highlight
    if (path === '/api/highlights' && method === 'POST') {
      const body = await parseBody(request);
      const { articleId, text, selection } = body;

      if (!articleId || !text) {
        return new Response(JSON.stringify({ message: 'Article ID and text required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const inserted = await db.insert(schema.highlights)
        .values({
          articleId,
          textContent: text,
          note: selection || null,
          userId: 1, // TODO: Get from auth
        })
        .returning();

      return new Response(JSON.stringify(inserted[0]), {
        status: 201,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // DELETE /api/highlights/:id - Delete highlight
    const deleteMatch = path.match(/^\/api\/highlights\/(\d+)$/);
    if (deleteMatch && method === 'DELETE') {
      const highlightId = parseInt(deleteMatch[1]);
      
      await db.delete(schema.highlights)
        .where(eq(schema.highlights.id, highlightId));

      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // 404 for unknown routes
    return new Response(JSON.stringify({ message: 'Not Found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    console.error('Highlights API error:', error);
    return new Response(JSON.stringify({ message: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}
