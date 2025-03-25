import { TServerResponse } from '@/types/request'
import { TWallet } from '@/types/wallet'
import { toMutationFetcher, toQueryFetcher } from '@/utils/query'
import { privateRequest } from '@/utils/request'

import { TCreateWalletRequestParams } from './type'

export const depositToWallet = toMutationFetcher<
  {
    id: string
  },
  unknown
>('depositToWallet', async (data) => {
  return privateRequest('wallets/deposit', {
    method: 'POST',
    data: data,
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
      data: data,
    })
  },
)
