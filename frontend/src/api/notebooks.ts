import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { apiFetch } from "../utils/apiFetch";
import type { Notebook, NotebookDetail, Source } from "../types/notebook";

const API = import.meta.env.VITE_API_URL;

export const notebookKeys = {
  all: ["notebooks"] as const,
  detail: (id: string) => ["notebook", id] as const,
};

export const useNotebooks = () =>
  useQuery({
    queryKey: notebookKeys.all,
    queryFn: async (): Promise<Notebook[]> => {
      const res = await apiFetch(`${API}/api/notebook/get-all`);
      const body = await res.json();
      return body?.data ?? [];
    },
  });

export const useNotebook = (id: string) =>
  useQuery({
    queryKey: notebookKeys.detail(id),
    queryFn: async (): Promise<NotebookDetail> => {
      const res = await apiFetch(`${API}/api/notebook/get/${id}`);
      const body = await res.json();

      const sources: Source[] = (body?.data?.sources ?? []).map(
        (s: { name: string; type: "file" | "text" }, i: number) => ({
          id: `${i}-${s.name}`,
          name: s.name,
          type: s.type,
        }),
      );

      return {
        sources,
        interactions: body?.data?.interactions ?? [],
        initialIngestDone: !!body?.data?.initialIngestDone,
      };
    },
  });

export const useCreateNotebook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string): Promise<string> => {
      const res = await apiFetch(`${API}/api/notebook/create`, {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      const body = await res.json();
      if (!body.success) throw new Error(body.message || "Create failed");
      return body.data as string;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notebookKeys.all });
    },
  });
};

export const useDeleteNotebook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      const res = await apiFetch(`${API}/api/notebook/delete/${id}`);
      const body = await res.json();
      return body?.data?._id as string;
    },
    onSuccess: (deletedId) => {
      queryClient.setQueryData<Notebook[]>(notebookKeys.all, (prev) =>
        (prev ?? []).filter((n) => n._id !== deletedId),
      );
    },
  });
};

interface IngestVars {
  formData: FormData;
  optimisticSource: Source;
}

export const useIngestSource = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ formData }: IngestVars) => {
      const res = await apiFetch(`${API}/api/ingest`, {
        method: "POST",
        body: formData,
      });
      const body = await res.json();
      if (!body.success) throw new Error(body.message || "Ingest failed");
      return body;
    },
    onMutate: async ({ optimisticSource }: IngestVars) => {
      await queryClient.cancelQueries({ queryKey: notebookKeys.detail(id) });

      const previous = queryClient.getQueryData<NotebookDetail>(
        notebookKeys.detail(id),
      );

      queryClient.setQueryData<NotebookDetail>(
        notebookKeys.detail(id),
        (old) =>
          old
            ? { ...old, sources: [...old.sources, optimisticSource] }
            : old,
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(notebookKeys.detail(id), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notebookKeys.detail(id) });
    },
  });
};
