import { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { axiosInstance } from "~/lib/axios-instance";
import type { TNotesItem } from "./get";
import type { TCreateNotes } from "~/validation/notes";

export type CreateNotesResponse = {
  payload: TNotesItem;
};

export const createNotes = async <ResponseType = CreateNotesResponse>({
  options,
  body,
}: {
  options?: AxiosRequestConfig;
  body: TCreateNotes;
}) => {
  const response: AxiosResponse<ResponseType> = await axiosInstance({
    ...options,
    data: body,
    method: "post",
    url: "/v1/notes",
  });
  return response?.data;
};
