import { ICategory } from '@/types/category'
import { TServerResponse } from '@/types/request'
import { toQueryFetcher } from '@/utils/query'
import { privateRequest } from '@/utils/request'

export const getAllCategoryApi = toQueryFetcher<void, TServerResponse<ICategory[]>>('getAllCategoryApi', async () => {
  return privateRequest('/category')
})
