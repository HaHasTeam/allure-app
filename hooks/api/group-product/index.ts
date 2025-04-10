import { TGroupProduct } from '@/types/group-product'
import { TServerResponse } from '@/types/request'
import { toMutationFetcher, toQueryFetcher } from '@/utils/query'
import { privateRequest, publicRequest } from '@/utils/request'

import { TCreateGroupBuyingRequestParams } from './type'

export const getGroupProductByBrandIdApi = toQueryFetcher<string, TServerResponse<TGroupProduct[]>>(
  `getGroupProductByBrandId`,
  async (brandId) => {
    return publicRequest(`/group-products/get-by-brand/${brandId}`, {
      method: 'GET',
    })
  },
)

export const createGroupBuyingApi = toMutationFetcher<TCreateGroupBuyingRequestParams, TServerResponse<{ id: string }>>(
  'createGroupBuyingApi',
  async (params) => {
    return privateRequest('/group-products/start-event/', {
      method: 'POST',
      data: params,
    })
  },
)
