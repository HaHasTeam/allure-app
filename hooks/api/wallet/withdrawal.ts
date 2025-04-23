import { IBankAccount } from '../bank-account/type'

import { TServerResponse } from '@/types/request'
import { toMutationFetcher, toQueryFetcher } from '@/utils/query'
import { privateRequest } from '@/utils/request'

// Types
export interface IWithdrawalRequest {
  id: string
  amount: number
  status: string
  bankAccount: IBankAccount
  createdAt: string
  updatedAt: string
}

export interface ICreateWithdrawalRequestParams {
  amount: number
  bankAccountId: string
}

// API functions as individual exports
export const createWithdrawalRequestApi = toMutationFetcher<
  ICreateWithdrawalRequestParams,
  TServerResponse<IWithdrawalRequest>
>('createWithdrawalRequestApi', async (data: ICreateWithdrawalRequestParams) => {
  return privateRequest('/withdrawal-requests', {
    method: 'POST',
    data
  })
})

export const getWithdrawalRequestsApi = toQueryFetcher<void, TServerResponse<IWithdrawalRequest[]>>(
  'getWithdrawalRequestsApi',
  async () => {
    return privateRequest('/withdrawal-requests', {
      method: 'GET'
    })
  }
)

// If you need a specific withdrawal request by ID
export const getWithdrawalRequestByIdApi = toQueryFetcher<string, TServerResponse<IWithdrawalRequest>>(
  'getWithdrawalRequestByIdApi',
  async (params?: string) => {
    if (!params) throw new Error('Withdrawal request ID is required')
    return privateRequest(`/withdrawal-requests/${params}`, {
      method: 'GET'
    })
  }
)
