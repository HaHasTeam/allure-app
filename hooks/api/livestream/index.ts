import { LiveStreamEnum } from "@/types/enum";
import { IResponseProduct } from "@/types/product";
import { TServerResponse } from "@/types/request";
import { toMutationFetcher, toQueryFetcher } from "@/utils/query";
import { privateRequest, publicRequest } from "@/utils/request";
import { ClientRoleType } from "react-native-agora";
export interface TokenResponse {
  token: string;
}
export interface LivestreamResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  startTime: string;
  endTime: string;
  livestreamProducts: LiveSteamDetail[];
  record: string | null;
  thumbnail: string | null;
  status: string;
}
export interface LiveSteamDetail {
  id: string;
  createdAt: string;
  updatedAt: string;
  discount: number;
  product: IResponseProduct;
}
export interface TokenRequestParams {
  channelName: string;
  role: ClientRoleType;
  privilegeExpirationInSecond: number;
}
// Define filter parameters type for livestreams
export interface LivestreamFilterParams {
  search?: string;
  sortBy?: string;
  order?: "ASC" | "DESC";
  limit?: number;
  page?: number;
  status?: LiveStreamEnum;
  startDate?: string;
  endDate?: string;
}

export const getListLiveStreamApi = toQueryFetcher<
  LivestreamFilterParams,
  TServerResponse<LivestreamResponse[]>
>("getListLiveStreamApi", async (params) => {
  return publicRequest(`livestreams`, {
    method: "GET",
    params: {
      ...params,
    },
  });
});

export const getActiveLiveStreamApi = toQueryFetcher<
  LivestreamFilterParams,
  TServerResponse<LivestreamResponse[]>
>("getListLiveStreamApi", async (params) => {
  return publicRequest(`livestreams/active-live`, {
    method: "GET",
    params: {
      ...params,
    },
  });
});

export const getLiveStreamById = toQueryFetcher<
  string,
  TServerResponse<LivestreamResponse>
>("getLiveStreamById", async (params) => {
  return publicRequest(`livestreams/get-by-id/${params}`, {
    method: "GET",
  });
});
export const getLiveStreamByIdMutation = toMutationFetcher<
  string,
  TServerResponse<LivestreamResponse>
>("getLiveStreamByIdMutation", async (params) => {
  return privateRequest(`livestreams/get-by-id/${params}`, {
    method: "GET",
  });
});
export const getCustomTokenLivestreamApi = toMutationFetcher<
  TokenRequestParams,
  TServerResponse<TokenResponse>
>("getCustomTokenLivestreamApi", async (params) => {
  return privateRequest(`livestreams/token`, {
    method: "POST",
    data: params,
  });
});
