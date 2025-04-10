import i18next from 'i18next'
import { z } from 'zod'

import { emailRegex, phoneRegex } from '@/constants/regex'

export const getContactUsSchema = () => {
  return z.object({
    fullName: z.string().min(1, i18next.t('validation.required')),
    email: z.string().refine((val) => emailRegex.pattern.test(val), { message: emailRegex.message }),
    phone: z.string().refine(phoneRegex.pattern, phoneRegex.message),
    message: z.string().min(1, i18next.t('validation.required')).max(255, i18next.t('validation.tooLong')),
  })
}
export const ContactUsSchema = getContactUsSchema()
export type IContactUsSchemaData = z.infer<typeof ContactUsSchema>
