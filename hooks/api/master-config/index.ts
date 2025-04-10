import { IMasterConfig } from '@/types/master-config'
import { TServerResponse } from '@/types/request'
import { toQueryFetcher } from '@/utils/query'
import { publicRequest } from '@/utils/request'

export const getMasterConfigApi = toQueryFetcher<string, TServerResponse<IMasterConfig[]>>(
  'getMasterConfigApi',
  async () => {
    return publicRequest(`/master-config/`, {
      method: 'GET',
    })
  },
)
