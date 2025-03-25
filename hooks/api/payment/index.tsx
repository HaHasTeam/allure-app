import { TServerResponse } from '@/types/request'
import { toMutationFetcher } from '@/utils/query'
import { privateRequest } from '@/utils/request'

import { TGeneratePaymentLink } from './type'

export const generatePaymentLinkApi = toMutationFetcher<
  TGeneratePaymentLink,
  TServerResponse<{
    url: string
  }>
>('generatePaymentLinkApi', async (data) => {
  return privateRequest('/payments/create-payment-url', {
    method: 'POST',
    data,
  })
})
