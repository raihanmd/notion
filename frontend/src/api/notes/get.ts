import { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { axiosInstance } from "~/lib/axios-instance";

export type TNotesItem = {
  id: string;
  parent_id?: string;
  title: string;
  content: string;
  image?: string;
  icon?: string;
  is_published?: boolean;
  is_archived?: boolean;
  created_at: string;
  updated_at: string;
};

export type GetNotesListResponse = {
  payload: TNotesItem[];
};

export const getNotes = async <ResponseType = GetNotesListResponse>({
  options,
}: {
  options?: AxiosRequestConfig;
}) => {
  const response: AxiosResponse<ResponseType> = await axiosInstance({
    ...options,
    method: "get",
    url: "/v1/notes",
  });
  return response?.data;
};
