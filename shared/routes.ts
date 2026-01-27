import { z } from 'zod';
import { 
  insertUserSchema, 
  insertLibraryItemSchema, 
  insertHighlightSchema, 
  insertNoteSchema,
  users,
  articles,
  userLibrary,
  highlights,
  notes
} from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  articles: {
    ingest: {
      method: 'POST' as const,
      path: '/api/articles',
      input: z.object({ url: z.string().url() }),
      responses: {
        201: z.custom<typeof userLibrary.$inferSelect & { article: typeof articles.$inferSelect }>(),
        400: errorSchemas.validation,
        500: errorSchemas.internal,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/articles',
      input: z.object({
        status: z.enum(['inbox', 'queue', 'archive']).optional(),
        search: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof articles.$inferSelect & { 
          libraryId: number, 
          status: string, 
          isFavorite: boolean, 
          readProgress: number,
          savedAt: string 
        }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/articles/:id',
      responses: {
        200: z.custom<typeof articles.$inferSelect & { 
          libraryId: number, 
          status: string, 
          isFavorite: boolean, 
          readProgress: number,
          savedAt: string 
        }>(),
        404: errorSchemas.notFound,
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/articles/:id/status',
      input: z.object({
        status: z.enum(['inbox', 'queue', 'archive']).optional(),
        isFavorite: z.boolean().optional(),
        readProgress: z.number().min(0).max(1).optional(),
      }),
      responses: {
        200: z.custom<typeof userLibrary.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/articles/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  highlights: {
    list: {
      method: 'GET' as const,
      path: '/api/highlights',
      responses: {
        200: z.array(z.custom<typeof highlights.$inferSelect & { articleTitle: string }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/highlights',
      input: insertHighlightSchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof highlights.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/highlights/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  notes: {
    create: {
      method: 'POST' as const,
      path: '/api/notes',
      input: insertNoteSchema.omit({ userId: true }),
      responses: {
        201: z.custom<typeof notes.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/articles/:id/notes',
      responses: {
        200: z.array(z.custom<typeof notes.$inferSelect>()),
      },
    },
  },
};

// ============================================
// HELPER
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
