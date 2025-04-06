import { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { axiosInstance } from "~/lib/axios-instance";
import type { TCreateBlock, TReorderBlocks } from "~/validation/blocks";

export type TBlockItem = {
  id: string;
  note_id?: string;
  parent_id?: string;
  type: string;
  content: string;
  props?: string;
  position?: number;
  version?: number;
  created_at?: string;
  updated_at?: string;
};

export type CreateBlockResponse = {
  payload: TBlockItem;
};

export const createBlock = async <ResponseType = TBlockItem>({
  options,
  body,
}: {
  options?: AxiosRequestConfig;
  body: TCreateBlock;
}) => {
  const response: AxiosResponse<ResponseType> = await axiosInstance({
    ...options,
    data: body,
    method: "post",
    url: "/v1/blocks",
  });
  return response?.data;
};

export type ReorderBlockResponse = {
  success: boolean;
};

export const reorderBlock = async <ResponseType = ReorderBlockResponse>({
  options,
  body,
}: {
  options?: AxiosRequestConfig;
  body: TReorderBlocks;
}) => {
  const response: AxiosResponse<ResponseType> = await axiosInstance({
    ...options,
    data: body,
    method: "post",
    url: "/v1/blocks/reorder",
  });
  return response?.data;
};
