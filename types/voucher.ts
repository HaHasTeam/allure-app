import { TBrand } from './brand'
import { StatusEnum, VoucherUnavailableReasonEnum, VoucherUsedStatusEnum } from './enum'
import { IProduct } from './product'
import { TMetaData } from './request'

export type TVoucher = TMetaData & {
  name: string

  code: string

  type: string

  discountType: string

  discountValue: number

  maxDiscount: number

  minOrderValue: number

  description?: string

  status: StatusEnum | VoucherUsedStatusEnum

  amount?: number

  startTime: string

  endTime: string

  brand?: TBrand | string

  applyType?: string

  applyProducts?: IProduct[]

  reason?: VoucherUnavailableReasonEnum

  discount?: number

  used?: number
}

export interface ICheckoutItem {
  classificationId: string
  quantity: number
}
export interface ICategoryVoucher {
  checkoutItems?: ICheckoutItem[]
  brandItems?: ICheckoutItem[]
  brandId?: string
}

// for api requests best voucher
export interface IBestVoucher {
  checkoutItems?: ICategoryVoucher[]
  brandItems?: ICheckoutItem[]
  brandId?: string
}

// for api response best voucher
export interface IBrandBestVoucher {
  brandId: string
  bestVoucher: TVoucher
  bestDiscount: number
}

export interface IPlatformBestVoucher {
  bestVoucher: TVoucher
  bestDiscount: number
}

export interface ICategoryVoucherResponse {
  unclaimedVouchers: TVoucher[]
  availableVouchers: TVoucher[]
  unAvailableVouchers: TVoucher[]
}
