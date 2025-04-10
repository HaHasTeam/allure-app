import { IContactUsSchemaData } from '@/schemas/contact.schema'
import { TServerResponse } from '@/types/request'
import { toMutationFetcher } from '@/utils/query'
import { publicRequest } from '@/utils/request'

export const contactUsApi = toMutationFetcher<IContactUsSchemaData, TServerResponse<string>>(
  'contactUsApi',
  async (data) => {
    return publicRequest('/contact-us', {
      method: 'POST',
      data,
    })
  },
)
