import { Feather } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { View, StyleSheet } from 'react-native'

import MyText from '../common/MyText'
import { StatusTrackingIcon, StatusTrackingText } from '../status-tracking-order/StatusTrackingOrder'

import { myTheme } from '@/constants'
import { RequestStatusEnum, ShippingStatusEnum } from '@/types/enum'
import { UserRoleEnum } from '@/types/role'
import { IStatusTracking } from '@/types/status-tracking'

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
  orderCreatedAt: string
}
const OrderStatusTrackingDetail = ({ orderCreatedAt, statusTrackingData }: OrderStatusTrackingDetailProps) => {
  const { t } = useTranslation()

  const defaultTimeline = [
    {
      status: 'ORDER_CREATED',
      createdAt: orderCreatedAt,
      text: t('order.created'),
      icon: <Feather name='package' size={18} />,
      reason: '',
      updatedBy: ''
    }
  ]

  const databaseTimeline = statusTrackingData.map((tracking) => ({
    status: tracking.status,
    createdAt: tracking.createdAt,
    text: StatusTrackingText(tracking.status),
    icon: StatusTrackingIcon(tracking.status),
    reason: tracking.reason,
    updatedBy: tracking.updatedBy
      ? t(
          `role.${
            tracking.updatedBy.role.role === UserRoleEnum.MANAGER || tracking.updatedBy.role.role === UserRoleEnum.STAFF
              ? 'BRAND'
              : tracking.updatedBy.role.role
          }`
        )
      : ''
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
    <View style={styles.container}>
      <View>
        {timeline.map((step, index) => (
          <View key={index} style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              {isComplete(step, index) ? (
                <View style={styles.completedCircle}>
                  <Feather name='check' size={12} color='white' />
                </View>
              ) : (
                <View
                  style={[
                    styles.circle,
                    {
                      backgroundColor: currentIndex === index ? myTheme.emerald[500] : myTheme.muted
                    }
                  ]}
                />
              )}
              {index !== timeline.length - 1 && <View style={styles.line} />}
            </View>
            <View style={styles.contentContainer}>
              <MyText
                text={t('date.toLocaleDateTimeString', {
                  val: new Date(step?.createdAt)
                })}
                styleProps={{
                  fontSize: 14,
                  color: currentIndex === index ? myTheme.emerald[500] : myTheme.mutedForeground
                }}
              />
              <View style={styles.textContainer}>
                <MyText
                  text={
                    step.status === RequestStatusEnum.APPROVED
                      ? t('order.approvedCancelRequest')
                      : step.status === RequestStatusEnum.REJECTED
                        ? t('order.rejectedCancelRequest')
                        : StatusTrackingText(step.status)
                  }
                  styleProps={{
                    fontSize: 14,
                    fontWeight: '500',
                    color: currentIndex === index ? myTheme.emerald[500] : myTheme.mutedForeground
                  }}
                />
                {(step.status === ShippingStatusEnum.CANCELLED || step.status === RequestStatusEnum.APPROVED) && (
                  <View>
                    <View style={styles.infoRow}>
                      <MyText
                        text={`${t('orderDetail.cancelBy')}: `}
                        styleProps={{
                          fontSize: 14,
                          fontWeight: '500',
                          color: myTheme.mutedForeground
                        }}
                      />
                      <MyText
                        text={step.updatedBy}
                        styleProps={{
                          fontSize: 14,
                          color: myTheme.mutedForeground
                        }}
                      />
                    </View>

                    <View style={styles.infoRow}>
                      <MyText
                        text={`${t('order.cancelOrderReason.reason')}: `}
                        styleProps={{
                          fontSize: 14,
                          fontWeight: '500',
                          color: myTheme.mutedForeground
                        }}
                      />
                      {step.reason && (
                        <MyText
                          text={step.reason}
                          styleProps={{
                            fontSize: 14,
                            color: myTheme.mutedForeground
                          }}
                        />
                      )}
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 'auto'
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16
  },
  iconContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  },
  completedCircle: {
    width: 16,
    height: 16,
    backgroundColor: myTheme.emerald[500],
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  circle: {
    width: 16,
    height: 16,
    borderRadius: 8
  },
  line: {
    width: 2,
    height: 32,
    backgroundColor: myTheme.muted
  },
  contentContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start'
  },
  textContainer: {
    flexDirection: 'column'
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: 4
  }
})

export default OrderStatusTrackingDetail
