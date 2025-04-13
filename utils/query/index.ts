import { AxiosRequestConfig } from 'axios'

export const toQueryFetcher = <TParams = unknown, TResponse = unknown>(
  key: string,
  fetcher: (params?: TParams, options?: Partial<AxiosRequestConfig<TParams>>) => Promise<TResponse>,
  options?: Partial<AxiosRequestConfig<TParams>>
) => {
  const fn = async ({ queryKey }: { queryKey: [string] | [string, TParams] }) => {
    const params = queryKey.length > 1 ? queryKey[1] : undefined
    return fetcher(params, options)
  }

  return {
    queryKey: key,
    fn,
    raw: fetcher
  }
}
export const toMutationFetcher = <TParams = unknown, TResponse = unknown>(
  key: string,
  fetcher: (params: TParams, options?: Partial<AxiosRequestConfig<TParams>>) => Promise<TResponse>,
  options?: Partial<AxiosRequestConfig<TParams>>
) => {
  const fn = async (params: TParams) => {
    return fetcher(params, options)
  }

  return {
    mutationKey: key,
    fn,
    raw: fetcher
  }
}
