import { useCallback } from "react";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";

import { TServerError } from "@/types/request";
import { useToast } from "@/contexts/ToastContext";

type Props = {
  error: unknown;
  // eslint-disable-next-line
  form?: UseFormReturn<any>;
};

const useHandleServerError = () => {
  const { showToast } = useToast();
  const handleServerError = useCallback(
    ({ error, form }: Props) => {
      showToast((error as TServerError).message, "error", 4000);

      const parsedTypeErrors = (error as TServerError<FieldValues>).errors;

      if (form && parsedTypeErrors && form.setError) {
        Object.keys(parsedTypeErrors).map((key) => {
          form.setError(key as Path<FieldValues>, {
            message: parsedTypeErrors[key],
          });
        });
      }
    },
    [showToast]
  );
  return handleServerError;
};

export default useHandleServerError;
