// Main entry point for Cloudflare Pages Functions
// This routes requests to appropriate API handlers

export async function onRequest(context: { request: Request; env: any; params: Record<string, string> }) {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // Route to appropriate handler
  if (path.startsWith('/api/articles')) {
    const { onRequest: articlesHandler } = await import('./api/articles');
    return articlesHandler(context);
  }

  if (path.startsWith('/api/auth') || path.startsWith('/api/register') || path.startsWith('/api/login') || path.startsWith('/api/logout') || path === '/api/user') {
    const { onRequest: authHandler } = await import('./api/auth');
    return authHandler(context);
  }

  if (path.startsWith('/api/highlights')) {
    const { onRequest: highlightsHandler } = await import('./api/highlights');
    return highlightsHandler(context);
  }

  if (path.startsWith('/api/notes')) {
    const { onRequest: notesHandler } = await import('./api/notes');
    return notesHandler(context);
  }

  // Default response for unmatched routes
  return new Response(JSON.stringify({ message: 'API endpoint not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
}
