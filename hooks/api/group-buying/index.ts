import { TGroupBuying } from '@/types/group-buying'
import { IOrder, IUpdateGroupOrder } from '@/types/order'
import { TServerResponse } from '@/types/request'
import { toMutationFetcher, toQueryFetcher } from '@/utils/query'
import { privateRequest } from '@/utils/request'

export const getGroupBuyingByIdApi = toQueryFetcher<string, TServerResponse<TGroupBuying>>(
  'getGroupBuyingByIdApi',
  async (id) => {
    return privateRequest('/group-buyings/get-by-id/' + id)
  },
)

export const getOrderByGroupBuyingIdApi = toQueryFetcher<string, TServerResponse<IOrder>>(
  'getOrderByGroupBuyingIdApi',
  async (id) => {
    return privateRequest('/group-buyings/get-order/' + id)
  },
)

export const updateOrderGroupBuyingApi = toMutationFetcher<IUpdateGroupOrder, TServerResponse<IOrder>>(
  'updateOrderGroupBuyingApi',
  async (data) => {
    return privateRequest('/group-buyings/update-order/' + data?.orderId, {
      method: 'POST',
      data,
    })
  },
)
export const ownerCoolDownEndTimeApi = toMutationFetcher<string, TServerResponse<string>>(
  'ownerCoolDownEndTimeApi',
  async (id) => {
    return privateRequest('/group-buyings/start-to-end/' + id, {
      method: 'POST',
    })
  },
)
