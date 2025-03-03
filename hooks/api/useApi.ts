/* eslint-disable @typescript-eslint/no-unused-vars */
import { AxiosError } from "axios";
import { jwtDecode } from "jwt-decode";
import { useCallback } from "react";

import { DELETE, GET, PATCH, POST, PUT } from "../../utils/api.caller";

import { useSession } from "../useSession";
import { CommonErrorResponse } from "@/types";
import {
  TServerResponse,
  TServerResponseError,
  TServerResponseSuccess,
} from "@/types/request";
export interface IUser {
  role: string;
  iat: number;
  exp: number;
  name: string;
  sub: string;
}
export interface IApiOptions {
  method: "get" | "post" | "put" | "delete" | "patch";
  endpoint: string;
  headers?: object;
  params?: object;
  body?: object;
}

const useApi = () => {
  const { accessToken, logout, refreshToken, setToken } = useSession();

  const handleError = useCallback(
    async (error: unknown) => {
      const headersDefault = {
        Accept: "application/json",
        Authorization: `Bearer ${refreshToken}`,
      };
      let message = "";
      if (error instanceof AxiosError) {
        const errorStatusCode = error.response?.status;
        if (errorStatusCode === 401) {
          if (accessToken && refreshToken) {
            const decodedAccessToken = jwtDecode(accessToken) as IUser;
            const decodedRefreshToken = jwtDecode(refreshToken) as IUser;

            const accessTokenExpiration = decodedAccessToken.exp;
            const refreshTokenExpiration = decodedRefreshToken.exp;

            const currentTimestamp = Math.floor(new Date().getTime() / 1000);
            if (currentTimestamp > accessTokenExpiration) {
              if (currentTimestamp > refreshTokenExpiration) {
                await logout();
              } else {
                try {
                  const { data } = await POST(
                    "auth/refresh",
                    {},
                    {},
                    headersDefault
                  );
                  setToken(
                    data.data.accessToken as string,
                    data.data.refreshToken
                  );
                } catch (error) {
                  await logout();
                }
              }
            }
          } else {
            await logout();
          }
        }
        if (errorStatusCode === 403) {
          message = "Không có quyền truy cập";
        }
      }
      if (message) {
        return message;
      } else {
        throw error;
      }
    },
    [accessToken, logout, refreshToken, setToken]
  );

  /**
   * This function makes an API call based on the provided options.
   * It's wrapped in a useCallback to prevent unnecessary re-renders.
   *
   * @async
   * @function callApi
   * @template T
   * @param {string} method - The HTTP method for the API call.
   * @param {string} endpoint - The endpoint for the API call.
   * @param {Object} [headers={}] - The headers for the API call.
   * @param {Object} [params={}] - The parameters for the API call.
   * @param {Object} [body={}] - The body of the request for the API call.
   * @returns {Promise<{ data: T }>} - Returns a promise that resolves with the data from the response.
   * @throws Will throw an error if the API call fails.
   */
  const callApi = useCallback(
    async <T>(
      method: string,
      endpoint: string,
      headers = {},
      params = {},
      body = {}
    ): Promise<TServerResponse<T>> => {
      try {
        const headersDefault = {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
          ...headers,
        };
        let response;
        switch (method) {
          case "post": {
            response = await POST(endpoint, body, params, headersDefault);
            break;
          }
          case "put": {
            response = await PUT(endpoint, body, params, headersDefault);
            break;
          }
          case "delete": {
            response = await DELETE(endpoint, body, params, headersDefault);
            break;
          }
          case "patch": {
            response = await PATCH(endpoint, body, params, headersDefault);
            break;
          }
          default: {
            response = await GET(endpoint, params, headersDefault);
          }
        }
        return {
          data: response.data,
          error: null,
          message: response.data,
        } as TServerResponseSuccess<T>;
      } catch (error) {
        const message = await handleError(error);
        return {
          data: null,
          error: "API Error",
          message,
        } as TServerResponseError;
      }
    },
    [accessToken, handleError]
  );

  return callApi;
};

export default useApi;
