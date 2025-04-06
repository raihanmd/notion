import { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { axiosInstance } from "~/lib/axios-instance";
import type { TGetNotesParams, TQueryParamsNotes } from "~/validation/notes";

export type TNotesItem = {
  id: string;
  parent_id?: string;
  title: string;
  image?: string;
  icon?: string;
  is_published?: boolean;
  is_archived?: boolean;
  created_at: string;
  updated_at: string;
  blocks: any[];
};

export type GetNotesListResponse = {
  payload: TNotesItem[];
};

export const getNotes = async <ResponseType = GetNotesListResponse>({
  options,
  params,
}: {
  options?: AxiosRequestConfig;
  params?: TQueryParamsNotes;
}) => {
  const response: AxiosResponse<ResponseType> = await axiosInstance({
    ...options,
    params,
    method: "get",
    url: "/v1/notes",
  });
  return response?.data;
};

export type GetDetailNoteResponse = {
  payload: TNotesItem;
};

export const getDetailNote = async <ResponseType = GetDetailNoteResponse>({
  options,
  params,
}: {
  options?: AxiosRequestConfig;
  params?: TGetNotesParams;
}) => {
  const response: AxiosResponse<ResponseType> = await axiosInstance({
    ...options,
    method: "get",
    url: `/v1/notes/${params?.id}`,
  });
  return response?.data;
};
