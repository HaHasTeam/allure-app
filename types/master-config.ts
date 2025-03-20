import { StatusEnum } from './enum'
import { TServerFile } from './file'
import { TMetaData } from './request'

export interface IMasterConfig extends TMetaData {
  name: string
  logo: string
  maxLevelCategory: number
  groupBuyingRemainingTime: number
  autoCancelOrderTime: string
  autoCompleteOrderTime: string
  autoApproveRefundRequestTime: string
  feedbackTimeExpired: string
  refundTimeExpired: string
  maximumUpdateBrandProfileTime: number
  complaintTimeExpired: number
  autoUpdateOrderToRefundedStatusTime: string
  expiredReceivedTime: string
  status: StatusEnum
  banners: TServerFile[]
  expiredCustomerReceivedTime: string // fe add
  autoApprovedRequestCancelTime: string // fe add
  pendingAdminCheckRejectRefundRequestTime: string // fe add
  pendingCustomerShippingReturnTime: string // fe add
}
