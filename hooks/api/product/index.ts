import { ProductTagEnum } from '@/types/enum'
import { IProduct, IResponseProduct, IServerCreateProduct, TProduct } from '@/types/product'
import { TServerResponse } from '@/types/request'
import { TBaseFilterRequestParams } from '@/types/types'
import { toMutationFetcher, toQueryFetcher } from '@/utils/query'
import { privateRequest, publicRequest } from '@/utils/request'

import { TGetProductByBrandIdRequestParams } from './type'

export const getProductByBrandIdApi = toQueryFetcher<TGetProductByBrandIdRequestParams, TServerResponse<TProduct[]>>(
  'getProductByBrandIdApi',
  async (params) => {
    return privateRequest(`/products/get-by-brand/${params?.brandId}`)
  },
)

export const getAllProductApi = toQueryFetcher<void, TServerResponse<IResponseProduct[]>>(
  'getAllProductApi',
  async () => {
    return publicRequest('/products')
  },
)
export const getProductApi = toQueryFetcher<string, TServerResponse<IProduct>>('getProductApi', async (productId) => {
  return privateRequest(`/products/get-by-id/${productId}`)
})

export const createProductApi = toMutationFetcher<IServerCreateProduct, TServerResponse<IServerCreateProduct>>(
  'createProductApi',
  async (data) => {
    return privateRequest('/products', {
      method: 'POST',
      data,
    })
  },
)

type UpdateProductParams = { productId: string; data: IServerCreateProduct }

export const updateProductApi = toMutationFetcher<UpdateProductParams, TServerResponse<IServerCreateProduct>>(
  'updateProductApi',
  async ({ productId, data }: UpdateProductParams) => {
    return privateRequest(`/products/${productId}`, {
      method: 'PUT',
      data,
    })
  },
)
interface FilterParamProducts extends TBaseFilterRequestParams {
  minPrice?: number
  maxPrice?: number
  statuses?: string
}

export const getProductFilterApi = toQueryFetcher<
  FilterParamProducts,
  TServerResponse<{ total: string; limit: string; page: string }, IResponseProduct[]>
>('getProductFilterApi', async (params) => {
  return publicRequest(`/products/filter-product`, {
    method: 'GET',
    params: params,
  })
})
export const getRecommendProductsMutation = toMutationFetcher<
  { search: string; tag: ProductTagEnum; page?: string | number; limit?: string | number },
  TServerResponse<{ total: string }, IResponseProduct[]>
>('getRecommendProducts', async (data) => {
  return publicRequest('/products/get', {
    method: 'POST',
    data: {
      search: data.search,
      tag: data.tag,
    },
    params: {
      page: data.page,
      limit: data.limit,
    },
  })
})
export const getRecommendProducts = toQueryFetcher<
  { search: string; tag: ProductTagEnum; page: string | number; limit: string | number },
  TServerResponse<{ total: string; totalPages: number }, IResponseProduct[]>
>('getRecommendProducts', async (params) => {
  return publicRequest('/products/get', {
    method: 'POST',
    data: {
      search: params?.search || '',
      tag: params?.tag,
    },
    params: {
      page: params?.page,
      limit: params?.limit,
    },
  })
})
