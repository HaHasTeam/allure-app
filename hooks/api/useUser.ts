import { useCallback } from "react";

import useApi from "./useApi";

import { resolveError } from "@/utils";
import { IEditUserPayload, TUser } from "@/types/user";

const useUser = () => {
  const callApi = useApi();

  const rootEndpoint = "/accounts";

  const getProfile = useCallback(async () => {
    try {
      const result = await callApi<TUser>("get", rootEndpoint + "/me");
      return result.data;
    } catch (error) {
      return resolveError(error);
    }
  }, [callApi]);

  const editProfile = useCallback(
    async (data: IEditUserPayload) => {
      try {
        const result = await callApi<{ success: boolean }>(
          "put",
          rootEndpoint,
          {},
          {},
          data
        );
        return result.data?.success;
      } catch (error) {
        return resolveError(error);
      }
    },
    [callApi]
  );

  return { getProfile, editProfile };
};

export default useUser;
