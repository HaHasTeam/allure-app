import { TServerResponse } from '@/types/request'
import { toMutationFetcher } from '@/utils/query'
import { privateRequest } from '@/utils/request'

export const createFirebaseTokenApi = toMutationFetcher<void, TServerResponse<{ token: string }>>(
  'createFirebaseTokenApi',
  async () => {
    return privateRequest('/firebase-auth/generate-token', {
      method: 'POST',
    })
  },
)
