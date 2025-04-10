import { TVoucher } from '@/types/voucher'

export type TRequestCreateVoucherParams = Omit<TVoucher, 'id' | 'updatedAt' | 'createdAt' | 'brand'>

export type TGetVoucherByIdRequestParams = {
  voucherId: string
}
export type TUpdateStatusVoucherRequestParams = TGetVoucherByIdRequestParams & {
  status: string
}
export type TUpdateVoucherRequestParams = Omit<TVoucher, 'updatedAt' | 'createdAt' | 'brand'>
