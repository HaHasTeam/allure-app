import i18next from 'i18next'
import { z } from 'zod'

import { phoneRegex } from '@/constants/regex'
import { AddressEnum } from '@/types/enum'

export const getCreateAddressSchema = () => {
  return z.object({
    fullName: z.string().min(1, i18next.t('validation.required')),
    account: z.string().optional(),
    phone: z.string().refine(phoneRegex.pattern, phoneRegex.message),
    detailAddress: z.string().min(1, i18next.t('validation.required')),
    ward: z.string().min(1, i18next.t('validation.required')),
    district: z.string().min(1, i18next.t('validation.required')),
    province: z.string().min(1, i18next.t('validation.required')),
    fullAddress: z.string().optional(),
    notes: z.string().optional(),
    type: z.enum([AddressEnum?.HOME, AddressEnum?.OFFICE, AddressEnum.OTHER]).optional(),
    isDefault: z.boolean().optional(),
  })
}
export const UpdateDefaultAddressSchema = z.object({
  isDefault: z.boolean().optional(),
})

export const CreateAddressSchema = getCreateAddressSchema()
