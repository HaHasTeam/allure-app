import { useCallback } from "react";

import useApi from "./useApi";

import { resolveError } from "@/utils";
import { IResendOtpPayload, IRegisterPayload } from "../../types/auth";

const useAuth = () => {
  const callApi = useApi();

  const rootEndpoint = "/";

  const register = useCallback(
    async (data: IRegisterPayload) => {
      try {
        await callApi("post", rootEndpoint + "accounts", {}, {}, data);
        return true;
      } catch (error) {
        return resolveError(error);
      }
    },
    [callApi]
  );

  const verifyOtp = useCallback(
    async (data: any) => {
      try {
        await callApi("post", rootEndpoint + "verify-otp", {}, {}, data);
        return true;
      } catch (error) {
        return resolveError(error);
      }
    },
    [callApi]
  );

  const resendOtp = useCallback(
    async (data: IResendOtpPayload) => {
      try {
        await callApi("post", rootEndpoint + "resend-otp", {}, {}, data);
        return true;
      } catch (error) {
        return resolveError(error);
      }
    },
    [callApi]
  );

  return { register, verifyOtp, resendOtp };
};

export default useAuth;
