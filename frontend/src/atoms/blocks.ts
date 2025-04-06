import { apiServices } from "~/api";
import { useMutation } from "@tanstack/react-query";
import type {
  TCreateBlock,
  TGetBlock,
  TReorderBlocks,
  TUpdateBlock,
} from "~/validation/blocks";
import type {
  CreateBlockResponse,
  DeleteBlockResponse,
  ReorderBlockResponse,
  UpdateBlockResponse,
} from "~/api/blocks";

export const useBlockCreate = () => {
  return useMutation<CreateBlockResponse, Error, TCreateBlock>({
    mutationFn: (data) => apiServices.blocks.createBlock({ body: data }),
  });
};

export const useBlockUpdate = () => {
  return useMutation<
    UpdateBlockResponse,
    Error,
    { body: TUpdateBlock; params: TGetBlock }
  >({
    mutationFn: (data) =>
      apiServices.blocks.updateNotes({ body: data.body, params: data.params }),
  });
};

export const useBlockDelete = () => {
  return useMutation<DeleteBlockResponse, Error, TGetBlock>({
    mutationFn: (data) => apiServices.blocks.deleteBlock({ params: data }),
  });
};

export const useBlockReorder = () => {
  return useMutation<ReorderBlockResponse, Error, TReorderBlocks>({
    mutationFn: (data) => apiServices.blocks.reorderBlock({ body: data }),
  });
};
