import type { CreateNotesResponse } from "~/api/notes/post";
import type {
  TCreateNotes,
  TGetNotesParams,
  TQueryParamsNotes,
  TUpdateNotes,
} from "~/validation/notes";
import type { UpdateNotesResponse } from "~/api/notes/patch";
import { apiServices } from "~/api";
import { QUERY_KEY_NOTES } from "~/contants/query-key-notes";
import { toast } from "sonner";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
  type UseQueryOptions,
} from "@tanstack/react-query";
import type { GetDetailNoteResponse, GetNotesListResponse } from "~/api/notes";
import { useRouter } from "next/navigation";

type useNotesListSidebarConfig = {
  queryKey?: QueryKey;
  options?: UseQueryOptions<GetNotesListResponse>;
};

export const useNotesListSidebar = (config?: useNotesListSidebarConfig) => {
  const { queryKey = [QUERY_KEY_NOTES.NOTES_SIDEBAR], options } = config ?? {};

  return useQuery<GetNotesListResponse>({
    queryKey,
    queryFn: () => apiServices.notes.getNotes({}),
    ...options,
    placeholderData: {
      payload: [],
    },
    refetchOnWindowFocus: false,
  });
};

type useNotesListConfig = {
  queryKey?: QueryKey;
  params?: TQueryParamsNotes;
  options?: UseQueryOptions<GetNotesListResponse>;
};

export const useNotesList = (config?: useNotesListConfig) => {
  const {
    queryKey = [QUERY_KEY_NOTES.NOTES_LIST],
    params,
    options,
  } = config ?? {};

  return useQuery<GetNotesListResponse>({
    queryKey,
    queryFn: () => apiServices.notes.getNotes({ params }),
    ...options,
    placeholderData: {
      payload: [],
    },
    refetchOnWindowFocus: false,
  });
};

type useNoteDetailConfig = {
  queryKey?: QueryKey;
  params?: TGetNotesParams;
  options?: UseQueryOptions<GetDetailNoteResponse>;
};

export const useNoteDetail = (config?: useNoteDetailConfig) => {
  const {
    queryKey = [QUERY_KEY_NOTES.NOTES_DETAIL],
    params,
    options,
  } = config ?? {};
  const router = useRouter();

  return useQuery<GetDetailNoteResponse>({
    queryKey,
    queryFn: async () => {
      const data = await apiServices.notes.getDetailNote({ params });

      if (!data) {
        router.replace("/404");
      }

      return data;
    },
    ...options,
    placeholderData: {
      payload: {
        id: "",
        title: "",
        created_at: "",
        updated_at: "",
        share_policy: "",
        blocks: [],
        user: {
          id: "",
          username: "",
        },
      },
    },
    refetchOnWindowFocus: false,
  });
};

export const useNoteCreate = () => {
  const queryKey = [
    [QUERY_KEY_NOTES.NOTES_LIST],
    [QUERY_KEY_NOTES.NOTES_DETAIL],
    [QUERY_KEY_NOTES.NOTES_SIDEBAR],
  ];

  const queryClient = useQueryClient();

  return useMutation<CreateNotesResponse, Error, TCreateNotes>({
    mutationFn: (data) => apiServices.notes.createNotes({ body: data }),
    onSuccess: () => {
      toast.success("Note created");
      (queryKey as QueryKey[]).map((key: QueryKey) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
};

export const useNoteUpdate = () => {
  const queryKey = [
    [QUERY_KEY_NOTES.NOTES_LIST],
    [QUERY_KEY_NOTES.NOTES_DETAIL],
    [QUERY_KEY_NOTES.NOTES_SIDEBAR],
  ];

  const queryClient = useQueryClient();

  return useMutation<
    UpdateNotesResponse,
    Error,
    { body: TUpdateNotes; params: TGetNotesParams }
  >({
    mutationFn: (data) =>
      apiServices.notes.updateNotes({ body: data.body, params: data.params }),
    onSuccess: () => {
      // toast.success("Note updated");
      (queryKey as QueryKey[]).map((key: QueryKey) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
};

export const useNoteDelete = () => {
  const queryKey = [
    [QUERY_KEY_NOTES.NOTES_LIST],
    [QUERY_KEY_NOTES.NOTES_SIDEBAR],
  ];

  const queryClient = useQueryClient();

  return useMutation<UpdateNotesResponse, Error, TGetNotesParams>({
    mutationFn: (data) => apiServices.notes.deleteNotes({ params: data }),
    onSuccess: () => {
      toast.success("Note deleted");
      (queryKey as QueryKey[]).map((key: QueryKey) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
};
