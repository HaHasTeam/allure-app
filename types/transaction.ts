import { TBrand } from './brand'
import { IOrder } from './order'
import { PaymentMethodEnum } from './payment'
import { TMetaData } from './request'
import { TUser } from './user'

export type ITransaction = TMetaData & {
  order?: IOrder
  buyer: TUser
  brand?: TBrand
  amount: number
  balanceAfterTransaction: number
  paymentMethod: PaymentMethodEnum
  type: TransactionTypeEnum
  status?: TransactionStatusEnum
  description?: string
  metadata?: string
}

export enum TransactionTypeEnum {
  ORDER_PURCHASE = 'ORDER_PURCHASE', // Mua sản phẩm
  BOOKING_PURCHASE = 'BOOKING_PURCHASE', // Đặt booking
  DEPOSIT = 'DEPOSIT', // Nạp tiền
  WITHDRAW = 'WITHDRAW', // Rút tiền
  ORDER_REFUND = 'ORDER_REFUND', // Hoàn tiền sản phẩm (đã nhận hàng)
  BOOKING_REFUND = 'BOOKING_REFUND', // Hoàn tiền booking (đã sử dụng)
  ORDER_CANCEL = 'ORDER_CANCEL', // Hủy đơn sản phẩm (chưa nhận hàng)
  BOOKING_CANCEL = 'BOOKING_CANCEL',
  TRANSFER_TO_WALLET = 'TRANSFER_TO_WALLET'
}

export enum TransactionStatusEnum {
  COMPLETED = 'COMPLETED', // Giao dịch hoàn thành
  FAILED = 'FAILED', // Giao dịch thất bại
  REFUNDED = 'REFUNDED' // Giao dịch đã hoàn tiền
}

export type TransactionFilterParams = {
  types?: TransactionTypeEnum[]
  status?: TransactionStatusEnum
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}
