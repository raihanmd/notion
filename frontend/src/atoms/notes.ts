import { atomWithQuery } from "jotai-tanstack-query";
import { useAtom } from "jotai";

import type { GetNotesListResponse } from "~/api/notes";
import type { CreateNotesResponse } from "~/api/notes/post";
import type {
  TCreateNotes,
  TGetNotesParams,
  TUpdateNotes,
} from "~/validation/notes";
import type { UpdateNotesResponse } from "~/api/notes/patch";
import { apiServices } from "~/api";
import { QUERY_KEY_NOTES } from "~/contants/query-key-notes";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const listNotes = atomWithQuery<GetNotesListResponse>(() => ({
  queryKey: [QUERY_KEY_NOTES.NOTES_LIST],
  queryFn: () => apiServices.notes.getNotes({}),
  refetchOnWindowFocus: false,
  placeholderData: { payload: [] },
}));

export const useNotesList = () => {
  return useAtom(listNotes);
};

export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateNotesResponse, Error, TCreateNotes>({
    mutationFn: (data) => apiServices.notes.createNotes({ body: data }),
    onSuccess: () => {
      toast.success("Note created.");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_NOTES.NOTES_LIST] });
    },
  });
};

export const useUpdateNote = () => {
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
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_NOTES.NOTES_LIST] });
    },
  });
};

export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateNotesResponse, Error, TGetNotesParams>({
    mutationFn: (data) => apiServices.notes.deleteNotes({ params: data }),
    onSuccess: () => {
      toast.success("Note deleted.");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_NOTES.NOTES_LIST] });
    },
  });
};
