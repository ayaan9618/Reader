import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

// Fetch list of articles
export function useArticles(status?: 'home' | 'queue' | 'archive', search?: string) {
  return useQuery({
    queryKey: [api.articles.list.path, status, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      // Map 'home' to 'inbox' for backend compatibility
      const backendStatus = status === 'home' ? 'inbox' : status;
      if (backendStatus) params.append("status", backendStatus);
      if (search) params.append("search", search);
      
      const url = `${api.articles.list.path}?${params.toString()}`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch articles");
      
      return api.articles.list.responses[200].parse(await res.json());
    },
  });
}

// Fetch single article
export function useArticle(id: number) {
  return useQuery({
    queryKey: [api.articles.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.articles.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch article");
      return api.articles.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// Normalize URL - add https:// if missing
function normalizeUrl(input: string): string {
  let normalized = input.trim();
  // If it doesn't start with http:// or https://, add https://
  if (!normalized.match(/^https?:\/\//i)) {
    normalized = 'https://' + normalized;
  }
  return normalized;
}

// Ingest new article
export function useIngestArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (url: string) => {
      // Normalize URL before validation
      const normalizedUrl = normalizeUrl(url);
      const validated = api.articles.ingest.input.parse({ url: normalizedUrl });
      const res = await fetch(api.articles.ingest.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        // Handle Zod validation errors (array format)
        if (Array.isArray(error) && error[0]?.message) {
          throw new Error(error[0].message);
        }
        throw new Error(error.message || "Failed to save article");
      }
      
      return api.articles.ingest.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.articles.list.path] });
    },
  });
}

// Update article status/progress
export function useUpdateArticle(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: z.infer<typeof api.articles.updateStatus.input>) => {
      const url = buildUrl(api.articles.updateStatus.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Failed to update article");
      return api.articles.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.articles.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.articles.get.path, id] });
    },
  });
}

// Delete article from library
export function useDeleteArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.articles.delete.path, { id });
      const res = await fetch(url, { 
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to delete article");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.articles.list.path] });
    },
  });
}
