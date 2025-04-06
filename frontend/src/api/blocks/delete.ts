import { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { axiosInstance } from "~/lib/axios-instance";
import type { TBlockItem } from "./post";
import type { TGetBlock } from "~/validation/blocks";

export type DeleteBlockResponse = {
  payload: TBlockItem;
};

export const deleteBlock = async <ResponseType = DeleteBlockResponse>({
  options,
  params,
}: {
  options?: AxiosRequestConfig;
  params: TGetBlock;
}) => {
  const response: AxiosResponse<ResponseType> = await axiosInstance({
    ...options,
    method: "delete",
    url: `/v1/blocks/${params.id}`,
  });
  return response?.data;
};
