import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { env } from "~/env";

export const createAxiosInstance = ({ baseURL }: { baseURL?: string }) => {
  const axiosInstance = axios.create({
    baseURL,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
    },
  });

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      return Promise.reject(error);
    },
  );

  return axiosInstance;
};

const baseURL = env.NEXT_PUBLIC_API_URL;
export const mainInstance = createAxiosInstance({ baseURL });

export const axiosInstance = async (options?: AxiosRequestConfig) => {
  try {
    const response = await mainInstance({ ...options });
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`[${options?.url}] ${error.response?.data}`);
      return error.response;
    } else if (axios.isCancel(error)) {
      console.error(`[${options?.url}] Operation Cancelled`);
    } else {
      return error as any;
    }
  }
};
