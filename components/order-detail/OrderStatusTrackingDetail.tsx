import { Check, Package } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { RequestStatusEnum, ShippingStatusEnum } from '@/types/enum'
import { UserRoleEnum } from '@/types/role'
import { IStatusTracking } from '@/types/status-tracking'

import { StatusTrackingIcon, StatusTrackingText } from '../status-tracking-order/StatusTrackingOrder'

interface IStep {
  status: string
  createdAt: Date | string
  text: string
  icon: JSX.Element
  reason: string | null
  updatedBy: string
}
interface OrderStatusTrackingDetailProps {
  statusTrackingData: IStatusTracking[]
}
const OrderStatusTrackingDetail = ({ statusTrackingData }: OrderStatusTrackingDetailProps) => {
  const { t } = useTranslation()

  const defaultTimeline = [
    {
      status: 'ORDER_CREATED',
      createdAt: statusTrackingData[0]?.createdAt,
      text: t('order.created'),
      icon: <Package className="w-5 h-5" />,
      reason: '',
      updatedBy: '',
    },
  ]

  const databaseTimeline = statusTrackingData.map((tracking) => ({
    status: tracking.status,
    createdAt: tracking.createdAt,
    text: StatusTrackingText(tracking.status),
    icon: StatusTrackingIcon(tracking.status),
    reason: tracking.reason,
    updatedBy: t(
      `role.${tracking.updatedBy.role.role === UserRoleEnum.MANAGER || tracking.updatedBy.role.role === UserRoleEnum.STAFF ? 'BRAND' : tracking.updatedBy.role.role}`,
    ),
  }))

  const timeline = [...defaultTimeline, ...databaseTimeline]
  const currentStatus = statusTrackingData[statusTrackingData.length - 1]?.status
  const currentIndex = timeline.findIndex((step) => step.status === currentStatus)
  const isComplete = (step: IStep, index: number) => {
    const status = step.status
    return (
      (status === ShippingStatusEnum.COMPLETED && index === timeline.length - 1) ||
      status === ShippingStatusEnum.CANCELLED ||
      step.status === RequestStatusEnum.APPROVED ||
      status === ShippingStatusEnum.REFUNDED ||
      status === ShippingStatusEnum.RETURNED_FAIL
    )
  }
  return (
    <div className="mx-auto">
      <div className="">
        {timeline.map((step, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="flex flex-col items-center justify-center">
              {isComplete(step, index) ? (
                <div className={`w-4 h-4 flex items-center justify-center bg-emerald-500 rounded-full`}>
                  <Check className="w-3 h-3 text-white" />
                </div>
              ) : (
                <div className={`w-4 h-4 ${currentIndex === index ? 'bg-emerald-500' : 'bg-muted'} rounded-full`} />
              )}
              {index !== timeline.length - 1 && <div className="w-0.5 h-8 bg-muted" />}
              {/* {index === timeline.length - 1 && <div className="w-3 h-3 bg-muted rounded-full" />} */}
            </div>
            <div className="flex gap-2 items-start">
              <div
                className={`text-sm min-w-fit ${currentIndex === index ? 'text-emerald-500' : 'text-muted-foreground'}`}
              >
                {t('date.toLocaleDateTimeString', { val: new Date(step?.createdAt) })}
              </div>
              <div className="flex flex-col">
                <div
                  className={`text-sm font-medium ${currentIndex === index ? 'text-emerald-500' : 'text-muted-foreground'}`}
                >
                  {step.status === RequestStatusEnum.APPROVED
                    ? t('order.approvedCancelRequest')
                    : step.status === RequestStatusEnum.REJECTED
                      ? t('order.rejectedCancelRequest')
                      : StatusTrackingText(step.status)}
                </div>
                {(step.status === ShippingStatusEnum.CANCELLED || step.status === RequestStatusEnum.APPROVED) && (
                  <div>
                    <div className="text-sm text-muted-foreground mt-1">
                      <span className="font-medium">{t('orderDetail.cancelBy')}: </span>
                      {step.updatedBy}
                    </div>

                    <div className="text-sm text-muted-foreground mt-1">
                      <span className="font-medium">{t('order.cancelOrderReason.reason')}: </span>
                      {step.reason}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrderStatusTrackingDetail
