import { TServerResponse, TServerResponseWithPagination } from '@/types/request'
import { IWithdrawalRequest, WithdrawalRequestFilterParams, WithdrawalRequestStatusEnum } from '@/types/wallet'
import { toMutationFetcher, toQueryFetcher } from '@/utils/query'
import { privateRequest } from '@/utils/request'

export interface ICreateWithdrawalRequestParams {
  amount: number
  bankAccountId: string
}

// Get withdrawal requests for current user with pagination
export const getWithdrawalRequestsApi = toQueryFetcher<
  WithdrawalRequestFilterParams,
  TServerResponseWithPagination<IWithdrawalRequest[]>
>('getWithdrawalRequestsApi', async (params?: WithdrawalRequestFilterParams) => {
  const { page, limit, ...bodyParams } = params || {}
  const body: WithdrawalRequestFilterParams = {}
  if (bodyParams.statuses?.length) {
    body.statuses = bodyParams.statuses
  }

  return privateRequest('/withdrawal-requests/get-my-withdrawal-requests', {
    method: 'POST',
    data: body,
    params: { page, limit }
  })
})

// Create withdrawal request
export const createWithdrawalRequestApi = toMutationFetcher<
  ICreateWithdrawalRequestParams,
  TServerResponse<IWithdrawalRequest>
>('createWithdrawalRequestApi', async (data: ICreateWithdrawalRequestParams) => {
  return privateRequest('/withdrawal-requests', {
    method: 'POST',
    data
  })
})

// Get withdrawal request by ID
export const getWithdrawalRequestByIdApi = toQueryFetcher<string, TServerResponse<IWithdrawalRequest>>(
  'getWithdrawalRequestByIdApi',
  async (id?: string) => {
    if (!id) throw new Error('Withdrawal request ID is required')
    return privateRequest(`/withdrawal-requests/${id}`, {
      method: 'GET'
    })
  }
)

// Cancel a withdrawal request
export const cancelWithdrawalRequestApi = toMutationFetcher<string, TServerResponse<IWithdrawalRequest>>(
  'cancelWithdrawalRequestApi',
  async (id: string) => {
    if (!id) throw new Error('Withdrawal request ID is required')
    return privateRequest(`/withdrawal-requests/update/${id}`, {
      method: 'POST',
      data: {
        status: WithdrawalRequestStatusEnum.CANCELLED
      }
    })
  }
)
