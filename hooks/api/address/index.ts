import { IAddress, IDistrictDetail, IProvince, IProvinceDetail } from '@/types/address'
import { TServerResponse } from '@/types/request'
import { toMutationFetcher, toQueryFetcher } from '@/utils/query'
import { privateRequest, provincesPublicRequest } from '@/utils/request'

export const getAllAddressesApi = toQueryFetcher<void, TServerResponse<IAddress[]>>('getAllAddressesApi', async () => {
  return privateRequest('/address', {
    method: 'GET',
  })
})

export const createAddressApi = toMutationFetcher<IAddress, TServerResponse<IAddress>>(
  'createAddressApi',
  async (data) => {
    return privateRequest('/address', {
      method: 'POST',
      data,
    })
  },
)
export const getMyAddressesApi = toQueryFetcher<void, TServerResponse<IAddress[]>>('getMyAddressesApi', async () => {
  return privateRequest('/address/get-my-address', {
    method: 'GET',
  })
})

export const getAddressByIdApi = toQueryFetcher<IAddress, TServerResponse<IAddress>>(
  'getAddressByIdApi',
  async (params) => {
    return privateRequest(`/address/get-by-id/${params?.id}`, {
      method: 'GET',
    })
  },
)

export const updateAddressApi = toMutationFetcher<IAddress, TServerResponse<IAddress>>(
  'updateAddressApi',
  async (data) => {
    return privateRequest(`/address/${data.id}`, {
      method: 'PUT',
      data,
    })
  },
)
export const getProvincesApi = toQueryFetcher<void, IProvince[]>('getProvincesApi', async () => {
  return provincesPublicRequest(`/p/`, {
    method: 'GET',
  })
})
export const getDistrictsByProvinceApi = toQueryFetcher<string, IProvinceDetail>(
  'getDistrictsByProvinceApi',
  async (provinceCode) => {
    return provincesPublicRequest(`/p/${provinceCode}?depth=2`, {
      method: 'GET',
    })
  },
)
export const getWardsByDistrictApi = toQueryFetcher<string, IDistrictDetail>(
  'getWardsByDistrictApi',
  async (districtCode) => {
    return provincesPublicRequest(`/d/${districtCode}?depth=2`, {
      method: 'GET',
    })
  },
)
