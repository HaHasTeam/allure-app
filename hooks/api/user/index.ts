import configs from '@/config'
import { TAuth } from '@/types/auth'
import { TServerResponse } from '@/types/request'
import { toMutationFetcher, toQueryFetcher } from '@/utils/query'
import { privateRequest, publicRequest } from '@/utils/request'

import {
  TCreateUserRequestParams,
  TInviteCoWorkerRequestParams,
  TInviteMultipleCoWorkersRequestParams,
  TLoginUserRequestParams,
  TUpdateUserRequestParams,
  TUpdateUsersListStatusRequestParams,
  TUpdateUserStatusRequestParams,
  TUserResponse,
} from './type'

const verifyEmailRedirectUrl = import.meta.env.VITE_APP_URL + configs.routes.checkEmail
export const getUserProfileApi = toQueryFetcher<void, TServerResponse<TUserResponse>>('getUserProfileApi', async () => {
  return privateRequest('/accounts/me')
})

export const createUserApi = toMutationFetcher<TCreateUserRequestParams, TServerResponse<TUserResponse>>(
  'createUserApi',
  async (data) => {
    return publicRequest('/accounts', {
      method: 'POST',
      data: {
        ...data,
        url: data.redirectUrl || verifyEmailRedirectUrl,
      },
    })
  },
)

export const signInWithPasswordApi = toMutationFetcher<TLoginUserRequestParams, TServerResponse<TAuth>>(
  'signInApi',
  async (data) => {
    return publicRequest('/auth/login', {
      method: 'POST',
      data,
    })
  },
)

export const updateProfileApi = toMutationFetcher<TUpdateUserRequestParams, TServerResponse<TUserResponse>>(
  'updateProfileApi',
  async (data) => {
    return privateRequest('/accounts', {
      method: 'PUT',
      data,
    })
  },
)

export const inviteCoWorkersApi = toMutationFetcher<TInviteCoWorkerRequestParams, TServerResponse<void>>(
  'inviteMultipleCoWorkersApi',
  async (data) => {
    return privateRequest('/accounts/request-create-account', {
      method: 'POST',
      data: {
        email: data.email,
        role: data.role,
        brand: data.brand,
        url: data.redirectUrl,
      },
    })
  },
)

export const inviteMultipleCoWorkersApi = toMutationFetcher<
  TInviteMultipleCoWorkersRequestParams,
  TServerResponse<void>[]
>('inviteMultipleCoWorkersApi', async (data) => {
  const { emails, role, brand, redirectUrl } = data
  const requests = emails.map((email) => {
    return inviteCoWorkersApi.raw({ email, role, brand, redirectUrl })
  })
  return Promise.all(requests)
})

export const getAllUserApi = toQueryFetcher<void, TServerResponse<TUserResponse[]>>('getAllUserApi', async () => {
  return privateRequest('/accounts')
})

export const updateUserStatusApi = toMutationFetcher<TUpdateUserStatusRequestParams, TServerResponse<void>>(
  'updateUserStatusApi',
  async (data) => {
    return privateRequest(`/accounts/update-account-status/${data.id}`, {
      method: 'PUT',
      data: {
        status: data.status,
      },
    })
  },
)

export const updateUsersListStatusApi = toMutationFetcher<TUpdateUsersListStatusRequestParams, TServerResponse<void>[]>(
  'updateUsersListStatusApi',
  async (data) => {
    const { ids, status } = data
    const requests = ids.map((id) => {
      return updateUserStatusApi.raw({ id, status })
    })
    return Promise.all(requests)
  },
)
