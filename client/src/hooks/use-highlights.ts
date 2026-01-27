import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

export function useHighlights() {
  return useQuery({
    queryKey: [api.highlights.list.path],
    queryFn: async () => {
      const res = await fetch(api.highlights.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch highlights");
      return api.highlights.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateHighlight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.highlights.create.input>) => {
      const res = await fetch(api.highlights.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create highlight");
      return api.highlights.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.highlights.list.path] });
    },
  });
}

export function useDeleteHighlight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.highlights.delete.path, { id });
      const res = await fetch(url, { 
        method: "DELETE",
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to delete highlight");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.highlights.list.path] });
    },
  });
}
