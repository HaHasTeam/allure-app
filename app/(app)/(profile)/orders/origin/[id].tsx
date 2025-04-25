'use client'

import { Feather } from '@expo/vector-icons'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { useRoute } from '@react-navigation/native'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocalSearchParams } from 'expo-router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, View } from 'react-native'
import { Button, Card, Text } from 'react-native-ui-lib'

import AlertMessage from '@/components/alert/AlertMessage'
import BrandOrderInformation from '@/components/brand/BrandOrderInformation'
import Empty from '@/components/empty'
import LoadingContentLayer from '@/components/loading/LoadingContentLayer'
import CancelOrderDialog from '@/components/order/CancelOrderDialog'
import OrderDetailItems from '@/components/order-detail/OrderDetailItems'
import OrderGeneral from '@/components/order-detail/OrderGeneral'
import OrderSummary from '@/components/order-detail/OrderSummary'
import OrderStatus from '@/components/order-status'
import { QRCodeAlertDialog } from '@/components/payment/QRCodeAlertDialog'
import RePaymentDialog from '@/components/payment/RePaymentDialog'
import { myTheme } from '@/constants'
import { useToast } from '@/contexts/ToastContext'
import { getMasterConfigApi } from '@/hooks/api/master-config'
import { filterOrdersParentApi, getParentOrderByIdApi, getStatusTrackingByIdApi } from '@/hooks/api/order'
import { payTransactionApi } from '@/hooks/api/transaction'
import { PAY_TYPE } from '@/hooks/api/transaction/type'
import { getMyWalletApi } from '@/hooks/api/wallet'
import useHandleServerError from '@/hooks/useHandleServerError'
import { OrderEnum, PaymentMethod, ShippingStatusEnum } from '@/types/enum'
import { calculatePaymentCountdown } from '@/utils/order'

const OrderParentDetail = () => {
  const { id: orderId } = useLocalSearchParams()

  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [openCancelParentOrderDialog, setOpenCancelParentOrderDialog] = useState<boolean>(false)
  const [isTrigger, setIsTrigger] = useState<boolean>(false)
  const [isOpenQRCodePayment, setIsOpenQRCodePayment] = useState(false)
  const [openRepayment, setOpenRepayment] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isChangePaymentMethod, setIsChangePaymentMethod] = useState<boolean>(false)
  const [paymentId, setPaymentId] = useState<string | undefined>(undefined)
  const { showToast } = useToast()
  const handleServerError = useHandleServerError()
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  const { data: useOrderData, isFetching } = useQuery({
    queryKey: [getParentOrderByIdApi.queryKey, (orderId as string) ?? ''],
    queryFn: getParentOrderByIdApi.fn,
    enabled: !!orderId
  })

  const { data: useStatusTrackingData } = useQuery({
    queryKey: [getStatusTrackingByIdApi.queryKey, (orderId as string) ?? ''],
    queryFn: getStatusTrackingByIdApi.fn,
    enabled: !!orderId
  })

  const { data: masterConfig } = useQuery({
    queryKey: [getMasterConfigApi.queryKey],
    queryFn: getMasterConfigApi.fn
  })
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const toggleModalVisibility = () => {
    if (openCancelParentOrderDialog) {
      bottomSheetModalRef.current?.close() // Close modal if it's visible
    } else {
      bottomSheetModalRef.current?.present() // Open modal if it's not visible
    }
    setOpenCancelParentOrderDialog(!openCancelParentOrderDialog) // Toggle the state
  }
  const { mutateAsync: payTransaction } = useMutation({
    mutationKey: [payTransactionApi.mutationKey],
    mutationFn: payTransactionApi.fn,
    onSuccess: () => {
      setIsLoading(false)
      showToast(t('payment.paymentSuccess'), 'success')
      queryClient.invalidateQueries({
        queryKey: [filterOrdersParentApi.queryKey]
      })
      queryClient.invalidateQueries({
        queryKey: [getMyWalletApi.queryKey]
      })
      queryClient.invalidateQueries({
        queryKey: [getParentOrderByIdApi.queryKey]
      })
    },
    onError: (error) => {
      setIsLoading(false)
      handleServerError({ error })
    }
  })

  useEffect(() => {
    if (masterConfig && useOrderData && useOrderData.data) {
      setTimeLeft(calculatePaymentCountdown(useOrderData.data, masterConfig.data).timeLeft)
      const timer = setInterval(() => {
        setTimeLeft(calculatePaymentCountdown(useOrderData.data, masterConfig.data).timeLeft)
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [useOrderData, masterConfig])

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: [getParentOrderByIdApi.queryKey]
    })
  }, [isTrigger, queryClient])

  const isShowPayment = useMemo(
    () =>
      masterConfig && useOrderData && calculatePaymentCountdown(useOrderData.data, masterConfig.data).remainingTime > 0,
    [masterConfig, useOrderData]
  )

  const onPaymentSuccess = useCallback(() => {
    showToast(t('payment.paymentSuccess'), 'success')
    setOpenRepayment(false)
  }, [showToast, t])

  const onClose = useCallback(() => {
    setIsLoading(false)
    setOpenRepayment(false)
    if (isChangePaymentMethod) {
      queryClient.invalidateQueries({
        queryKey: [filterOrdersParentApi.queryKey]
      })
      queryClient.invalidateQueries({
        queryKey: [getMyWalletApi.queryKey]
      })
      queryClient.invalidateQueries({
        queryKey: [getParentOrderByIdApi.queryKey]
      })
    }
  }, [isChangePaymentMethod, queryClient])

  if (isFetching) {
    return <LoadingContentLayer />
  }

  if (!useOrderData || !useOrderData?.data) {
    return (
      <Empty
        title={t('empty.orderDetail.title')}
        description={t('empty.orderDetail.description')}
        linkText={t('empty.orderDetail.button')}
      />
    )
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{t('orderDetail.title')}</Text>
          <Text style={styles.orderId}>#{useOrderData?.data?.id?.substring(0, 8).toUpperCase()}</Text>
        </View>
        <View style={styles.headerStatusContainer}>
          <Text style={styles.statusLabel}>{t('orderDetail.status')}: </Text>
          <OrderStatus tag={useOrderData?.data?.status ?? ''} size='medium' />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Payment Alert */}
        {(useOrderData.data.paymentMethod === PaymentMethod.WALLET ||
          useOrderData.data.paymentMethod === PaymentMethod.BANK_TRANSFER) &&
          useOrderData.data.status === ShippingStatusEnum.TO_PAY && (
            <View style={styles.alertContainer}>
              <AlertMessage
                title={t('order.paymentTitle')}
                message={t('payment.notifyPayment', {
                  total: t('productCard.currentPrice', { price: useOrderData?.data.totalPrice }),
                  val:
                    String(timeLeft.hours).padStart(2, '0') +
                    ':' +
                    String(timeLeft.minutes).padStart(2, '0') +
                    ':' +
                    String(timeLeft.seconds).padStart(2, '0'),
                  method:
                    useOrderData?.data.paymentMethod === PaymentMethod.WALLET
                      ? t('wallet.WALLET')
                      : useOrderData?.data.paymentMethod === PaymentMethod.BANK_TRANSFER
                        ? t('payment.methods.bank_transfer')
                        : t('payment.methods.cash')
                })}
                isShowIcon={false}
              />
            </View>
          )}

        {/* Shipping Information */}
        <Card style={styles.card}>
          <OrderGeneral
            title={t('orderDetail.shippingAddress')}
            icon={<Feather name='truck' size={20} color={myTheme.foreground} />}
            content={
              <View style={styles.shippingInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{t('orderDetail.recipientName')}:</Text>
                  <Text style={styles.infoValue}>{useOrderData?.data?.recipientName}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{t('orderDetail.address')}:</Text>
                  <Text style={styles.infoValue}>{useOrderData?.data?.shippingAddress}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{t('orderDetail.phone')}:</Text>
                  <Text style={styles.infoValue}>{useOrderData?.data?.phone}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{t('orderDetail.notes')}:</Text>
                  <Text style={styles.infoValue}>{useOrderData?.data?.notes ?? t('orderDetail.no')}</Text>
                </View>
              </View>
            }
          />
        </Card>

        {/* Order Items */}
        {useOrderData.data.children.length > 0 &&
          useOrderData.data.children.map((orderItem, index) => (
            <View key={orderItem.id || index} style={styles.orderItemContainer}>
              {/* Brand Information */}
              <BrandOrderInformation
                brandId={
                  (
                    orderItem?.orderDetails?.[0]?.productClassification?.preOrderProduct ??
                    orderItem?.orderDetails?.[0]?.productClassification?.productDiscount ??
                    orderItem?.orderDetails?.[0]?.productClassification
                  )?.product?.brand?.id ?? ''
                }
                brandName={
                  (
                    orderItem?.orderDetails?.[0]?.productClassification?.preOrderProduct ??
                    orderItem?.orderDetails?.[0]?.productClassification?.productDiscount ??
                    orderItem?.orderDetails?.[0]?.productClassification
                  )?.product?.brand?.name ?? 'Brand'
                }
                brandLogo={
                  (
                    orderItem?.orderDetails?.[0]?.productClassification?.preOrderProduct ??
                    orderItem?.orderDetails?.[0]?.productClassification?.productDiscount ??
                    orderItem?.orderDetails?.[0]?.productClassification
                  )?.product?.brand?.logo ?? 'Brand'
                }
              />

              {/* Order Details */}
              <Card style={styles.orderDetailsCard}>
                <OrderDetailItems
                  orderDetails={orderItem?.orderDetails}
                  status={orderItem?.status}
                  brand={
                    (
                      orderItem?.orderDetails?.[0]?.productClassification?.preOrderProduct ??
                      orderItem?.orderDetails?.[0]?.productClassification?.productDiscount ??
                      orderItem?.orderDetails?.[0]?.productClassification
                    )?.product?.brand ?? null
                  }
                  accountAvatar={orderItem?.account?.avatar ?? ''}
                  accountName={orderItem?.account?.username ?? ''}
                  masterConfig={masterConfig?.data}
                  statusTracking={useStatusTrackingData?.data}
                />

                {/* Order Summary */}
                <OrderSummary
                  totalProductCost={orderItem?.subTotal}
                  totalBrandDiscount={orderItem?.shopVoucherDiscount}
                  totalPlatformDiscount={orderItem?.platformVoucherDiscount}
                  totalPayment={orderItem?.totalPrice}
                  paymentMethod={orderItem?.paymentMethod}
                />
              </Card>

              {/* Message */}
              <Card style={styles.messageCard}>
                <OrderGeneral
                  title={t('orderDetail.message')}
                  icon={<Feather name='message-square' size={20} color={myTheme.foreground} />}
                  content={
                    <Text style={styles.messageText}>
                      <Text style={styles.messageLabel}>{t('orderDetail.message')}: </Text>
                      {orderItem?.message && orderItem?.message !== '' ? orderItem?.message : t('orderDetail.no')}
                    </Text>
                  }
                />
              </Card>
            </View>
          ))}

        {/* Payment Actions */}
        {(useOrderData.data.paymentMethod === PaymentMethod.WALLET ||
          useOrderData.data.paymentMethod === PaymentMethod.BANK_TRANSFER) &&
          useOrderData.data.status === ShippingStatusEnum.TO_PAY && (
            <View style={styles.actionButtonsContainer}>
              <Button
                outline
                outlineColor={myTheme.primary}
                style={styles.cancelButton}
                labelStyle={styles.cancelButtonLabel}
                onPress={() => setOpenCancelParentOrderDialog(true)}
                label={t('order.cancelOrder')}
              />

              {isShowPayment && (
                <>
                  {useOrderData?.data.type !== OrderEnum.GROUP_BUYING && !useOrderData?.data.isPaymentMethodUpdated && (
                    <Button
                      outline
                      outlineColor={myTheme.primary}
                      style={styles.changeMethodButton}
                      labelStyle={styles.cancelButtonLabel}
                      onPress={() => setOpenRepayment(true)}
                      label={t('payment.changePaymentMethod')}
                    />
                  )}
                  <Button
                    backgroundColor={myTheme.primary}
                    style={styles.payButton}
                    loading={isLoading}
                    onPress={() => {
                      if (useOrderData.data.paymentMethod === PaymentMethod.BANK_TRANSFER) {
                        setIsOpenQRCodePayment(true)
                        setPaymentId(useOrderData?.data.id)
                        return
                      }
                      if (useOrderData?.data.paymentMethod === PaymentMethod.WALLET) {
                        if (useOrderData?.data && useOrderData?.data.id) {
                          setIsLoading(true)
                          payTransaction({
                            orderId: useOrderData?.data.id,
                            id: useOrderData?.data.id,
                            type: PAY_TYPE.ORDER
                          })
                        }
                      }
                    }}
                    label={t('order.payment')}
                  />
                </>
              )}
            </View>
          )}
      </View>

      {/* Dialogs */}
      <CancelOrderDialog
        toggleModalVisibility={toggleModalVisibility}
        setIsModalVisible={setOpenCancelParentOrderDialog}
        onOpenChange={setOpenCancelParentOrderDialog}
        bottomSheetModalRef={bottomSheetModalRef}
        setIsTrigger={setIsTrigger}
        orderId={useOrderData?.data?.id ?? ''}
        isParent
      />

      <QRCodeAlertDialog
        amount={useOrderData?.data.totalPrice}
        open={isOpenQRCodePayment}
        onOpenChange={setIsOpenQRCodePayment}
        type={PAY_TYPE.ORDER}
        paymentId={paymentId}
        onSuccess={onPaymentSuccess}
        onClose={onClose}
      />

      <RePaymentDialog
        onOpenChange={setOpenRepayment}
        open={openRepayment}
        orderId={useOrderData?.data?.id}
        paymentMethod={useOrderData?.data?.paymentMethod as PaymentMethod}
        setIsOpenQRCodePayment={setIsOpenQRCodePayment}
        setPaymentId={setPaymentId}
        totalPayment={useOrderData?.data?.totalPrice}
        setIsChangePaymentMethod={setIsChangePaymentMethod}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: myTheme.background
  },
  contentContainer: {
    paddingBottom: 24
  },
  header: {
    padding: 16,
    backgroundColor: myTheme.white,
    borderBottomWidth: 1,
    borderBottomColor: myTheme.border
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: myTheme.mutedForeground,
    marginRight: 8
  },
  orderId: {
    fontSize: 16,
    color: myTheme.mutedForeground
  },
  headerStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: myTheme.mutedForeground,
    marginRight: 8
  },
  content: {
    padding: 16,
    gap: 16
  },
  alertContainer: {
    marginBottom: 16
  },
  card: {
    padding: 16,
    backgroundColor: myTheme.white,
    borderRadius: 8,
    marginBottom: 16
  },
  shippingInfo: {
    gap: 8
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  infoLabel: {
    fontWeight: '500',
    marginRight: 4,
    color: myTheme.foreground
  },
  infoValue: {
    flex: 1,
    color: myTheme.foreground
  },
  orderItemContainer: {
    marginBottom: 16
  },
  orderDetailsCard: {
    backgroundColor: myTheme.white,
    borderRadius: 8,
    marginVertical: 8,
    overflow: 'hidden'
  },
  messageCard: {
    padding: 16,
    backgroundColor: myTheme.white,
    borderRadius: 8
  },
  messageText: {
    color: myTheme.foreground
  },
  messageLabel: {
    fontWeight: '500'
  },
  actionButtonsContainer: {
    gap: 12,
    marginTop: 8
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: myTheme.primary,
    backgroundColor: 'transparent',
    marginBottom: 8
  },
  changeMethodButton: {
    borderWidth: 1,
    borderColor: myTheme.primary,
    backgroundColor: 'transparent',
    marginBottom: 8
  },
  cancelButtonLabel: {
    color: myTheme.primary
  },
  payButton: {
    backgroundColor: myTheme.primary
  }
})

export default OrderParentDetail
