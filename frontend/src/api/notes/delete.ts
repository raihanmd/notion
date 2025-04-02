import { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { axiosInstance } from "~/lib/axios-instance";
import type { TNotesItem } from "./get";
import type { TGetNotesParams } from "~/validation/notes";

export type DeleteNotesResponse = {
  payload: TNotesItem;
};

export const deleteNotes = async <ResponseType = DeleteNotesResponse>({
  options,
  params,
}: {
  options?: AxiosRequestConfig;
  params: TGetNotesParams;
}) => {
  const response: AxiosResponse<ResponseType> = await axiosInstance({
    ...options,
    method: "delete",
    url: `/v1/notes/${params.id}`,
  });
  return response?.data;
};
