import { ICart, ICartByBrand, ICartItem, ICreateCartItem, IRemoveCartItem, IUpdateCartItem } from '@/types/cart'
import { TServerResponse } from '@/types/request'
import { toMutationFetcher, toQueryFetcher } from '@/utils/query'
import { privateRequest } from '@/utils/request'

export const createCartItemApi = toMutationFetcher<ICreateCartItem, TServerResponse<ICartItem>>(
  'createCartItemApi',
  async (data) => {
    return privateRequest('/cart', {
      method: 'POST',
      data,
    })
  },
)
export const removeMultipleCartItemApi = toMutationFetcher<IRemoveCartItem, TServerResponse<ICartItem>>(
  'removeMultipleCartItemApi',
  async (data) => {
    return privateRequest('/cart/remove-multiple', {
      method: 'POST',
      data,
    })
  },
)
export const removeAllCartItemApi = toMutationFetcher<void, TServerResponse<ICartItem>>(
  'removeAllCartItemApi',
  async () => {
    return privateRequest('/cart/remove-all', {
      method: 'POST',
    })
  },
)

export const getMyCartApi = toQueryFetcher<void, TServerResponse<ICartByBrand>>('getMyCartApi', async () => {
  return privateRequest('/cart/get-my-cart', {
    method: 'GET',
  })
})

export const getCartByIdApi = toQueryFetcher<ICartItem, TServerResponse<ICartItem>>(
  'getCartByIdApi',
  async (params) => {
    return privateRequest(`/cart/${params?.id}`, {
      method: 'GET',
    })
  },
)

export const getAllCartListApi = toQueryFetcher<void, TServerResponse<ICart[]>>('getAllCartListApi', async () => {
  return privateRequest('/cart', {
    method: 'GET',
  })
})

export const updateCartItemApi = toMutationFetcher<IUpdateCartItem, TServerResponse<ICartItem>>(
  'updateCartItemApi',
  async (data) => {
    return privateRequest(`/cart/${data.id}`, {
      method: 'PUT',
      data,
    })
  },
)
export const deleteCartItemApi = toMutationFetcher<string, TServerResponse<ICartItem>>(
  'deleteCartItemApi',
  async (cartItemId) => {
    return privateRequest(`/cart/${cartItemId}`, {
      method: 'DELETE',
    })
  },
)
