import { useCallback } from 'react'
import { FieldValues, Path, UseFormReturn } from 'react-hook-form'

import { TServerError } from '@/types/request'

import { useToast } from './useToast'

type Props = {
  error: unknown
  // eslint-disable-next-line
  form?: UseFormReturn<any>
}

const useHandleServerError = () => {
  const { errorToast } = useToast()
  const handleServerError = useCallback(
    ({ error, form }: Props) => {
      errorToast({
        message: (error as TServerError).message,
      })

      const parsedTypeErrors = (error as TServerError<FieldValues>).errors

      if (form && parsedTypeErrors && form.setError) {
        Object.keys(parsedTypeErrors).map((key) => {
          form.setError(key as Path<FieldValues>, {
            message: parsedTypeErrors[key],
          })
        })
      }
    },
    [errorToast],
  )
  return handleServerError
}

export default useHandleServerError
