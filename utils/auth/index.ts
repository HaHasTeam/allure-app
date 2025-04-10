import { jwtDecode, JwtPayload } from "jwt-decode";

import {
  INVALID_ACCESS_TOKEN,
  REFRESH_TOKEN_EXPIRED,
  UNAUTHENTICATED,
} from "@/constants/error";
import { useStore } from "@/store/store";

type TGetAuthDataParams = {
  keepPrevious: boolean;
};

const bufferTime = 1000 * 60 * 5;
export const getAuthData = async (params?: TGetAuthDataParams) => {
  const { authData } = useStore.getState();
  if (!authData) throw new Error(UNAUTHENTICATED);
  const decodedToken = jwtDecode<JwtPayload>(authData.accessToken);
  //   If keepPrevious is true, return the authData
  if (params?.keepPrevious) return authData;

  if (!decodedToken.exp) throw new Error(INVALID_ACCESS_TOKEN);
  // If over 5 minutes from expiration, throw an error
  const isExpired = Date.now() >= decodedToken.exp * 1000 - bufferTime;
  if (isExpired) {
    const isRefreshExpired = Date.now() >= decodedToken.exp * 1000 - bufferTime;
    if (isRefreshExpired) throw new Error(REFRESH_TOKEN_EXPIRED);
    else {
      //get new access token and refresh token
      //todo
      useStore.getState().setAuthState({
        isAuthenticated: true,
        isLoading: false,
        authData,
      });

      return authData;
    }
  }
  return authData;
};
