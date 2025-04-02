import { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { axiosInstance } from "~/lib/axios-instance";
import type { TNotesItem } from "./get";
import type { TGetNotesParams, TUpdateNotes } from "~/validation/notes";

export type UpdateNotesResponse = {
  payload: TNotesItem;
};

export const updateNotes = async <ResponseType = UpdateNotesResponse>({
  options,
  params,
  body,
}: {
  options?: AxiosRequestConfig;
  params: TGetNotesParams;
  body: TUpdateNotes;
}) => {
  const response: AxiosResponse<ResponseType> = await axiosInstance({
    ...options,
    data: body,
    method: "patch",
    url: `/v1/notes/${params.id}`,
  });
  return response?.data;
};
