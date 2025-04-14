import { AxiosRequestConfig } from 'axios'

import { axiosProvincesRequest, axiosRequest } from '@/network/axios'
import { getItem } from '@/utils/asyncStorage'

export const privateRequest = async <R>(url: string, options?: AxiosRequestConfig): Promise<R> => {
  const accessToken = await getItem('accessToken')
  console.log('go here')

  return axiosRequest({
    ...options,
    url,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...options?.headers
    }
  })
}

export const publicRequest = async <R>(url: string, options?: AxiosRequestConfig): Promise<R> => {
  return axiosRequest({
    url,
    ...options,
    headers: {
      ...options?.headers
    }
  })
}

export const provincesPublicRequest = async <R>(url: string, options?: AxiosRequestConfig): Promise<R> => {
  return axiosProvincesRequest({
    url,
    ...options,
    headers: {
      ...options?.headers
    }
  })
}
