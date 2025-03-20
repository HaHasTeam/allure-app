import type { RawAxiosRequestConfig } from "axios";

export const axiosBaseOptions: RawAxiosRequestConfig = {
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    Accept: "application/json",
  },
};

export const axiosProvincesOptions: RawAxiosRequestConfig = {
  baseURL: process.env.EXPO_PUBLIC_API_PROVINCE_URL,
  headers: {
    Accept: "application/json",
  },
};
