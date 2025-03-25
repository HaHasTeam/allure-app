import { IBranch, TBrand } from '@/types/brand'
import { TServerResponse } from '@/types/request'
import { toMutationFetcher, toQueryFetcher } from '@/utils/query'
import { privateRequest, publicRequest } from '@/utils/request'

import { TRequestCreateBrandParams, TUpdateBrandRequestParams, TUpdateStatusBrandRequestParams } from './type'

export const requestCreateBrandApi = toMutationFetcher<TRequestCreateBrandParams, TServerResponse<IBranch>>(
  'requestCreateBrand',
  async (params) => {
    return privateRequest('/brands/create', {
      method: 'POST',
      data: params,
    })
  },
)
export const updateStatusBrandByIdApi = toMutationFetcher<TUpdateStatusBrandRequestParams, TServerResponse<IBranch>>(
  'updateStatusBrandById',
  async (params) => {
    return privateRequest(`/brands/update-status/`, {
      method: 'PUT',
      data: {
        reason: 'fdsaf',
        brandId: params?.brandId,
        status: params.status,
      },
    })
  },
)

export const updateBrandByIdApi = toMutationFetcher<TUpdateBrandRequestParams, TServerResponse<IBranch>>(
  'updateBrandById',
  async (params) => {
    return privateRequest(`/brands/update-detail/${params?.brandId}`, {
      method: 'PUT',
      data: params,
    })
  },
)
export const getBrandByIdApi = toQueryFetcher<string, TServerResponse<IBranch>>('getBrandById', async (brandId) => {
  return publicRequest(`/brands/get-by-id/${brandId}`, {
    method: 'GET',
  })
})
export const getAllBrandsApi = toQueryFetcher<void, TServerResponse<TBrand[]>>('getAllBrands', async () => {
  return publicRequest(`/brands/`, {
    method: 'GET',
  })
})

export const getBrandsHasGroupProductApi = toQueryFetcher<void, TServerResponse<IBranch[]>>(
  'getBrandsHasGroupProductApi',
  async () => {
    return publicRequest(`/group-products/get-brands-have-group-products/`, {
      method: 'GET',
    })
  },
)
