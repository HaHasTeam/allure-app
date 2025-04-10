import { TServerResponse } from '@/types/request'
import { toMutationFetcher } from '@/utils/query'
import { publicRequest } from '@/utils/request'

export const uploadFilesApi = toMutationFetcher<FormData, TServerResponse<string[]>>(
  'uploadFilesApi',
  async (formData) => {
    return publicRequest('/files/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data' },
      data: formData,
    })
  },
)
