import { TServerError } from '@/types/request'
import { toMutationFetcher, toQueryFetcher } from '@/utils/query'
import { publicRequest } from '@/utils/request'

import { TChangePasswordRequestParams } from './type'

export const activateAccountApi = toQueryFetcher<string, TServerError>('activateAccountApi', async (accountId) => {
  return publicRequest(`/accounts/verify-account/${accountId}`, {
    method: 'PUT',
  })
})

export const changePasswordApi = toMutationFetcher<TChangePasswordRequestParams, TServerError>(
  'changePasswordApi',
  async (params) => {
    return publicRequest(`/accounts/modify-password/${params?.accountId}`, {
      method: 'PUT',
      data: params,
    })
  },
)
export const requestResetPasswordApi = toMutationFetcher<string, TServerError>(
  'requestResetPasswordApi',
  async (email) => {
    return publicRequest(`/accounts/request-reset-pass`, {
      method: 'POST',
      data: { email },
    })
  },
)
