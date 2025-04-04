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

  return useQuery<GetDetailNoteResponse>({
    queryKey,
    queryFn: () => apiServices.notes.getDetailNote({ params }),
    ...options,
    refetchOnWindowFocus: false,
  });
};

export const useNoteCreate = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateNotesResponse, Error, TCreateNotes>({
    mutationFn: (data) => apiServices.notes.createNotes({ body: data }),
    onSuccess: () => {
      toast.success("Note created.");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_NOTES.NOTES_LIST] });
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
      toast.success("Note updated.");
      (queryKey as QueryKey[]).map((key: QueryKey) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
};

export const useNoteDelete = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateNotesResponse, Error, TGetNotesParams>({
    mutationFn: (data) => apiServices.notes.deleteNotes({ params: data }),
    onSuccess: () => {
      toast.success("Note deleted.");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_NOTES.NOTES_LIST] });
    },
  });
};
