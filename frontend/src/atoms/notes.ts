import { atomWithQuery } from "jotai-tanstack-query";
import { useAtom } from "jotai"; // Added useSetAtom

import type { GetNotesListResponse } from "~/api/notes";
import { apiServices } from "~/api";
import { QUERY_KEY_NOTES } from "~/contants/query-key-notes";
import type { CreateNotesResponse } from "~/api/notes/post";
import type { TCreateNotes } from "~/validation/notes";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const listNotes = atomWithQuery<GetNotesListResponse>(() => ({
  queryKey: [QUERY_KEY_NOTES.NOTES_LIST],
  queryFn: () => apiServices.notes.getNotes({}),
  refetchOnWindowFocus: false,
}));

export const useNotesList = () => {
  return useAtom(listNotes);
};

export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateNotesResponse, Error, TCreateNotes>({
    mutationFn: (data) => apiServices.notes.createNotes({ body: data }),
    onSuccess: () => {
      toast.success("Note created successfully.");
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY_NOTES.NOTES_LIST] });
    },
  });
};
