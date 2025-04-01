import { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { axiosInstance } from "~/lib/axios-instance";
import type { TNotesItem } from "./get";
import type { z } from "zod";
import type { createNotesValidationSchema } from "~/validation/notes";

export type CreateNotesResponse = {
  payload: TNotesItem;
};

export const createNotes = async <ResponseType = CreateNotesResponse>({
  options,
  body,
}: {
  options?: AxiosRequestConfig;
  body: z.infer<typeof createNotesValidationSchema>;
}) => {
  const response: AxiosResponse<ResponseType> = await axiosInstance({
    ...options,
    data: body,
    method: "post",
    url: "/v1/notes",
  });
  return response?.data;
};
