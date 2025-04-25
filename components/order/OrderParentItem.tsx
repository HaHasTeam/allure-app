import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { type Dispatch, type SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet } from 'react-native'
import { Button, Card, Text, View } from 'react-native-ui-lib'

import CancelOrderDialog from './CancelOrderDialog'
import OrderItem from './OrderItem'
import AlertMessage from '../alert/AlertMessage'
import { QRCodeAlertDialog } from '../payment/QRCodeAlertDialog'
import RePaymentDialog from '../payment/RePaymentDialog'

import { myTheme } from '@/constants'
import { useToast } from '@/contexts/ToastContext'
import { getMasterConfigApi } from '@/hooks/api/master-config'
import { filterOrdersParentApi, getParentOrderByIdApi } from '@/hooks/api/order'
import { payTransactionApi } from '@/hooks/api/transaction'
import { PAY_TYPE } from '@/hooks/api/transaction/type'
import { getMyWalletApi } from '@/hooks/api/wallet'
import useHandleServerError from '@/hooks/useHandleServerError'
import { OrderEnum, PaymentMethod } from '@/types/enum'
import type { IOrder } from '@/types/order'
import { calculatePaymentCountdown } from '@/utils/order'
import { BottomSheetModal } from '@gorhom/bottom-sheet'

interface OrderParentItemProps {
  order: IOrder
  setIsTrigger: Dispatch<SetStateAction<boolean>>
}

const OrderParentItem = ({ order, setIsTrigger }: OrderParentItemProps) => {
  const { t } = useTranslation()
  const router = useRouter()
  const { showToast } = useToast()
  const [isOpenQRCodePayment, setIsOpenQRCodePayment] = useState(false)
  const [openRepayment, setOpenRepayment] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [paymentId, setPaymentId] = useState<string | undefined>(undefined)
  const [openCancelParentOrderDialog, setOpenCancelParentOrderDialog] = useState<boolean>(false)
  const [isChangePaymentMethod, setIsChangePaymentMethod] = useState<boolean>(false)
  const queryClient = useQueryClient()
  const handleServerError = useHandleServerError()
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  const { data: masterConfig } = useQuery({
    queryKey: [getMasterConfigApi.queryKey],
    queryFn: getMasterConfigApi.fn
  })

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
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const toggleModalVisibility = () => {
    if (openCancelParentOrderDialog) {
      bottomSheetModalRef.current?.close() // Close modal if it's visible
    } else {
      bottomSheetModalRef.current?.present() // Open modal if it's not visible
    }
    setOpenCancelParentOrderDialog(!openCancelParentOrderDialog) // Toggle the state
  }
  useEffect(() => {
    if (masterConfig && order) {
      setTimeLeft(calculatePaymentCountdown(order, masterConfig.data).timeLeft)
      const timer = setInterval(() => {
        setTimeLeft(calculatePaymentCountdown(order, masterConfig.data).timeLeft)
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [order, masterConfig])

  const isShowPayment = useMemo(
    () => masterConfig && calculatePaymentCountdown(order, masterConfig.data).remainingTime > 0,
    [masterConfig, order]
  )

  const onPaymentSuccess = useCallback(() => {
    showToast(t('payment.paymentSuccess'), 'success')
    setOpenRepayment(false)
    setIsLoading(false)
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

  return (
    <Card style={styles.container}>
      {order.children?.map((orderItem) => (
        <View key={orderItem?.id}>
          <OrderItem
            brand={
              orderItem?.orderDetails[0]?.productClassification?.preOrderProduct?.product?.brand ??
              orderItem?.orderDetails[0]?.productClassification?.productDiscount?.product?.brand ??
              orderItem?.orderDetails[0]?.productClassification?.product?.brand ??
              null
            }
            orderItem={orderItem}
            setIsTrigger={setIsTrigger}
            isShowAction={false}
            orderId={order?.id}
          />
        </View>
      ))}

      <View style={styles.alertContainer}>
        <AlertMessage
          message={t('payment.notifyPayment', {
            total: t('productCard.currentPrice', { price: order.totalPrice }),
            val:
              String(timeLeft.hours).padStart(2, '0') +
              ':' +
              String(timeLeft.minutes).padStart(2, '0') +
              ':' +
              String(timeLeft.seconds).padStart(2, '0'),
            method:
              order.paymentMethod === PaymentMethod.WALLET
                ? t('payment.methods.wallet')
                : order.paymentMethod === PaymentMethod.BANK_TRANSFER
                  ? t('payment.methods.bank_transfer')
                  : t('payment.methods.cash')
          })}
        />
      </View>

      <View style={styles.footerContainer}>
        <View style={styles.footerContent}>
          <Text style={styles.lastUpdatedText}>
            {t('order.lastUpdated')}: {t('date.toLocaleDateTimeString', { val: new Date(order?.updatedAt) })}
          </Text>

          <View style={styles.buttonContainer}>
            <Button
              outline
              outlineColor={myTheme.primary}
              style={styles.outlineButton}
              labelStyle={styles.outlineButtonText}
              onPress={() => router.push(`/(profile)/orders/origin/${order?.id}`)}
              label={t('order.viewDetail')}
            />

            <Button
              outline
              outlineColor={myTheme.primary}
              style={styles.outlineButton}
              labelStyle={styles.outlineButtonText}
              onPress={() => setOpenCancelParentOrderDialog(true)}
              label={t('order.cancelOrder')}
            />

            {isShowPayment && (
              <>
                {order.type !== OrderEnum.GROUP_BUYING && !order.isPaymentMethodUpdated && (
                  <Button
                    outline
                    outlineColor={myTheme.primary}
                    style={styles.outlineButton}
                    labelStyle={styles.outlineButtonText}
                    onPress={() => {
                      setOpenRepayment(true)
                    }}
                    label={t('payment.changePaymentMethod')}
                  />
                )}

                <Button
                  backgroundColor={myTheme.primary}
                  style={styles.primaryButton}
                  loading={isLoading}
                  onPress={() => {
                    if (order.paymentMethod === PaymentMethod.BANK_TRANSFER) {
                      setIsOpenQRCodePayment(true)
                      setPaymentId(order.id)
                      return
                    }
                    if (order.paymentMethod === PaymentMethod.WALLET) {
                      if (order && order.id) {
                        setIsLoading(true)
                        payTransaction({ orderId: order.id, id: order.id, type: PAY_TYPE.ORDER })
                      }
                    }
                  }}
                  label={t('order.payment')}
                />
              </>
            )}
          </View>
        </View>
      </View>

      <CancelOrderDialog
        toggleModalVisibility={toggleModalVisibility}
        setIsModalVisible={setOpenCancelParentOrderDialog}
        onOpenChange={setOpenCancelParentOrderDialog}
        bottomSheetModalRef={bottomSheetModalRef}
        setIsTrigger={setIsTrigger}
        orderId={order?.id ?? ''}
        isParent
      />

      <QRCodeAlertDialog
        amount={order.totalPrice}
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
        orderId={order?.id}
        paymentMethod={order?.paymentMethod as PaymentMethod}
        setIsOpenQRCodePayment={setIsOpenQRCodePayment}
        setPaymentId={setPaymentId}
        totalPayment={order?.totalPrice}
        setIsChangePaymentMethod={setIsChangePaymentMethod}
      />
    </Card>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: myTheme.white,
    borderWidth: 1,
    borderColor: myTheme.border,
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 8,
    marginHorizontal: 4
  },
  alertContainer: {
    paddingHorizontal: 16,
    width: '100%'
  },
  footerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    width: '100%'
  },
  footerContent: {
    paddingTop: 16
  },
  lastUpdatedText: {
    color: myTheme.mutedForeground,
    fontSize: 14,
    marginBottom: 12
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'flex-end'
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: myTheme.primary,
    backgroundColor: 'transparent',
    marginVertical: 4
  },
  outlineButtonText: {
    color: myTheme.primary
  },
  primaryButton: {
    backgroundColor: myTheme.primary,
    marginVertical: 4
  }
})

export default OrderParentItem
