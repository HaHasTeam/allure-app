import { Feather } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'

import { myTheme } from '@/constants'
import { RequestStatusEnum, ShippingStatusEnum } from '@/types/enum'

export const StatusTrackingIcon = (status: string) => {
  switch (status) {
    case ShippingStatusEnum.JOIN_GROUP_BUYING:
      return <Feather name='users' size={18} color={myTheme.mutedForeground} />
    case ShippingStatusEnum.TO_PAY:
      return <Feather name='dollar-sign' size={18} color={myTheme.mutedForeground} />
    case ShippingStatusEnum.WAIT_FOR_CONFIRMATION:
      return <Feather name='package' size={18} color={myTheme.mutedForeground} />
    case ShippingStatusEnum.PREPARING_ORDER:
      return <Feather name='box' size={18} color={myTheme.mutedForeground} />
    case ShippingStatusEnum.TO_SHIP:
      return <Feather name='send' size={18} color={myTheme.mutedForeground} />
    case ShippingStatusEnum.SHIPPING:
      return <Feather name='truck' size={18} color={myTheme.mutedForeground} />
    case ShippingStatusEnum.DELIVERED:
      return <Feather name='check-square' size={18} color={myTheme.mutedForeground} />
    case ShippingStatusEnum.COMPLETED:
      return <Feather name='check' size={18} color={myTheme.mutedForeground} />
    case ShippingStatusEnum.RETURNING:
      return <Feather name='corner-down-left' size={18} color={myTheme.mutedForeground} />
    case ShippingStatusEnum.REFUNDED:
      return <Feather name='refresh-ccw' size={18} color={myTheme.mutedForeground} />
    case ShippingStatusEnum.CANCELLED:
      return <Feather name='x' size={18} color={myTheme.mutedForeground} />
    case RequestStatusEnum.APPROVED:
      return <Feather name='check-circle' size={18} color={myTheme.mutedForeground} />
    case RequestStatusEnum.REJECTED:
      return <Feather name='x-circle' size={18} color={myTheme.mutedForeground} />
    case ShippingStatusEnum.BRAND_RECEIVED:
      return <Feather name='circle' size={18} color={myTheme.mutedForeground} />
    case ShippingStatusEnum.RETURNED_FAIL:
      return <Feather name='refresh-cw' size={18} color={myTheme.mutedForeground} />
    default:
      return <Feather name='package' size={18} color={myTheme.mutedForeground} />
  }
}

export const StatusTrackingText = (status: string) => {
  const { t } = useTranslation()

  switch (status) {
    case ShippingStatusEnum.JOIN_GROUP_BUYING:
      return t('order.joinGroupBuying')
    case ShippingStatusEnum.TO_PAY:
      return t('order.pending')
    case ShippingStatusEnum.WAIT_FOR_CONFIRMATION:
      return t('order.waitConfirm')
    case ShippingStatusEnum.PREPARING_ORDER:
      return t('order.preparingOrder')
    case ShippingStatusEnum.TO_SHIP:
      return t('order.shipping')
    case ShippingStatusEnum.SHIPPING:
      return t('order.delivering')
    case ShippingStatusEnum.DELIVERED:
      return t('order.delivered')
    case ShippingStatusEnum.COMPLETED:
      return t('order.completed')
    case ShippingStatusEnum.RETURNING:
      return t('order.returning')
    case ShippingStatusEnum.REFUNDED:
      return t('order.refunded')
    case ShippingStatusEnum.RETURNED_FAIL:
      return t('order.returnedFail')
    case ShippingStatusEnum.BRAND_RECEIVED:
      return t('order.brandReceived')
    case ShippingStatusEnum.CANCELLED:
      return t('order.cancelled')
    case RequestStatusEnum.APPROVED:
      return t('order.cancelled')
    case RequestStatusEnum.REJECTED:
      return t('order.rejectedCancelRequestTitle')
    default:
      return t('order.created')
  }
}
