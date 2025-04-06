import { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { axiosInstance } from "~/lib/axios-instance";
import type { TBlockItem } from "./post";
import type { TGetBlock, TUpdateBlock } from "~/validation/blocks";

export type UpdateBlockResponse = {
  payload: TBlockItem;
};

export const updateNotes = async <ResponseType = UpdateBlockResponse>({
  options,
  params,
  body,
}: {
  options?: AxiosRequestConfig;
  params: TGetBlock;
  body: TUpdateBlock;
}) => {
  const response: AxiosResponse<ResponseType> = await axiosInstance({
    ...options,
    data: body,
    method: "patch",
    url: `/v1/blocks/${params.id}`,
  });
  return response?.data;
};
