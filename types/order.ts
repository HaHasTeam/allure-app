import { IClassification } from './classification'
import { PaymentMethod, RequestStatusEnum, ShippingStatusEnum } from './enum'
import { IResponseFeedback } from './feedback'
import { TFile, TServerFile } from './file'
import { TUser } from './user'
import { TVoucher } from './voucher'

export interface IOrderDetail {
  platformVoucherDiscount: number
  shopVoucherDiscount: number
  id: string
  createdAt: string
  updatedAt: string
  subTotal: number
  totalPrice: number
  quantity: number
  type: string | null
  isFeedback: boolean
  productClassification: IClassification
  productClassificationPreOrder: null | IClassification
  unitPriceAfterDiscount: number
  unitPriceBeforeDiscount: number
  feedback: IResponseFeedback | null
}
export interface IOrderFeedback extends IOrderItem {
  account: TUser
  productClassification: IClassification
  quantity: number
}
export interface IOrderDetailFeedback extends IOrderDetail {
  order: IOrderFeedback
}

export interface IOrderItem {
  platformVoucherDiscount: number
  shopVoucherDiscount: number
  id: string
  createdAt: string
  updatedAt: string
  subTotal: number
  totalPrice: number
  shippingAddress: string
  phone: string
  paymentMethod: PaymentMethod
  notes: string
  type: string
  status: ShippingStatusEnum
  orderDetails: IOrderDetail[]
  voucher: null | TVoucher
  message: string
  recipientName: string
  account: TUser
}

export type IOrder = {
  platformVoucherDiscount: number
  shopVoucherDiscount: number
  id: string
  createdAt: string
  updatedAt: string
  subTotal: number
  totalPrice: number
  shippingAddress: string
  phone: string
  paymentMethod: string
  notes: string
  type: string
  status: string
  account: TUser
  children: IOrderItem[]
  orderDetails: IOrderItem[] // for requests
}

export type IOrderFilter = {
  search?: string
  statusList?: string[]
}
export type IRequestFilter = {
  search?: string
  types?: string[]
  statusList?: string[]
}

export type IOrderCheckoutItem = {
  productClassificationId: string
  quantity?: number
}

export type ICreateOrderItem = {
  shopVoucherId?: string
  items: IOrderCheckoutItem[]
  message?: string
}

export type ICreateOrder = {
  orders: ICreateOrderItem[]
  addressId: string
  paymentMethod: string
  platformVoucherId?: string
}

export type ICreatePreOrder = {
  productClassificationId: string
  quantity: number
  addressId: string
  paymentMethod: string
  notes: string
}

export type ICreateGroupOrder = {
  groupBuyingId: string
  items: IOrderCheckoutItem[]
  addressId: string
}
export type IUpdateGroupOrder = {
  orderId: string
  items: IOrderCheckoutItem[]
  addressId: string
}

export type ICancelOrder = {
  orderId: string
  reason: string
}

export interface ICancelRequestOrder {
  id: string
  createdAt: string
  updatedAt: string
  reason: string
  status: RequestStatusEnum.APPROVED | RequestStatusEnum.REJECTED | RequestStatusEnum.PENDING
  order: IOrder
}

export interface IRequest {
  id: string
  createdAt: string
  updatedAt: string
  reason: string
  status: RequestStatusEnum.APPROVED | RequestStatusEnum.REJECTED | RequestStatusEnum.PENDING
  reasonRejected: string | null
  type: string
  mediaFiles: TFile[]
  rejectedRefundRequest: IRejectReturnRequestOrder
  order: IOrderItem
}

export interface IReturnRequestOrder extends ICancelRequestOrder {
  mediaFiles: TServerFile[]
  rejectedRefundRequest: IRejectReturnRequestOrder
  reasonRejected: string | null
}
export interface IRejectReturnRequestOrder extends ICancelRequestOrder {
  mediaFiles: TServerFile[]
}

export interface ICancelAndReturnRequest {
  cancelRequest: ICancelRequestOrder
  refundRequest: IReturnRequestOrder
  complaintRequest: IReturnRequestOrder
}
