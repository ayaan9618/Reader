import { z } from 'zod';
import { eq } from 'drizzle-orm';
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

// Auth API
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
    // POST /api/register - Register new user
    if (path === '/api/register' && method === 'POST') {
      const body = await parseBody(request);
      const { username, password } = body;

      if (!username || !password) {
        return new Response(JSON.stringify({ message: 'Username and password required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // Check if user exists
      const existingUser = await db.select()
        .from(schema.users)
        .where(eq(schema.users.username, username))
        .limit(1);

      if (existingUser.length > 0) {
        return new Response(JSON.stringify({ message: 'Username already exists' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // Hash password (simple implementation for now)
      const hashedPassword = password; // TODO: Use bcrypt in production

      // Create user
      const inserted = await db.insert(schema.users)
        .values({
          username,
          password: hashedPassword,
        })
        .returning();

      const user = inserted[0];
      const { password: _, ...userWithoutPassword } = user;

      return new Response(JSON.stringify(userWithoutPassword), {
        status: 201,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // POST /api/login - Login user
    if (path === '/api/login' && method === 'POST') {
      const body = await parseBody(request);
      const { username, password } = body;

      if (!username || !password) {
        return new Response(JSON.stringify({ message: 'Username and password required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      // Find user
      const users = await db.select()
        .from(schema.users)
        .where(eq(schema.users.username, username))
        .limit(1);

      if (users.length === 0) {
        return new Response(JSON.stringify({ message: 'Invalid credentials' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      const user = users[0];
      const { password: _, ...userWithoutPassword } = user;
      
      // Simple password check (TODO: Use bcrypt in production)
      if (user.password !== password) {
        return new Response(JSON.stringify({ message: 'Invalid credentials' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      return new Response(JSON.stringify(userWithoutPassword), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // GET /api/user - Get current user
    if (path === '/api/user' && method === 'GET') {
      // TODO: Get user from session/JWT
      return new Response(JSON.stringify({ message: 'Not implemented' }), {
        status: 501,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // POST /api/logout - Logout user
    if (path === '/api/logout' && method === 'POST') {
      // TODO: Clear session/JWT
      return new Response(JSON.stringify({ message: 'Logged out' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // 404 for unknown routes
    return new Response(JSON.stringify({ message: 'Not Found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    console.error('Auth API error:', error);
    return new Response(JSON.stringify({ message: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}
