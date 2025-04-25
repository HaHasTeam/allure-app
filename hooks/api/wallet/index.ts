import { TCreateWalletRequestParams } from './type'

import { TServerResponse } from '@/types/request'
import { TWallet } from '@/types/wallet'
import { toMutationFetcher, toQueryFetcher } from '@/utils/query'
import { privateRequest } from '@/utils/request'

export const depositToWallet = toMutationFetcher<
  {
    orderId: string
  },
  unknown
>('depositToWallet', async (data) => {
  return privateRequest('transactions/deposit', {
    method: 'POST',
    data
  })
})

export const getMyWalletApi = toQueryFetcher<void, TServerResponse<TWallet>>('getMyWalletApi', async () => {
  return privateRequest('/wallets/get-my-wallet')
})

export const createWalletApi = toMutationFetcher<TCreateWalletRequestParams, TServerResponse<TWallet>>(
  'createWalletApi',
  async (data) => {
    return privateRequest('/wallets', {
      method: 'POST',
      data
    })
  }
)
