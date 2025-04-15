/* eslint-disable radix */
import { Feather, MaterialIcons, Octicons } from '@expo/vector-icons'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { Header, HeaderBackButton } from '@react-navigation/elements'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocalSearchParams, useRouter, Stack } from 'expo-router'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'

import AlertMessage from '@/components/alert/AlertMessage'
import BrandOrderInformation from '@/components/brand/BrandOrderInformation'
import MyText from '@/components/common/MyText'
import Empty from '@/components/empty'
import LoadingContentLayer from '@/components/loading/LoadingContentLayer'
import LoadingIcon from '@/components/loading/LoadingIcon'
import CancelOrderDialog from '@/components/order/CancelOrderDialog'
import RequestCancelOrderDialog from '@/components/order/RequestCancelOrderDialog'
import { RequestReturnOrderDialog } from '@/components/order/RequestReturnOrderDialog'
import ReturnOrderSection from '@/components/order/ReturnOrderSection'
import ConfirmDecisionDialog from '@/components/order-detail/ConfirmDecisionDialog'
import OrderDetailItems from '@/components/order-detail/OrderDetailItems'
import OrderGeneral from '@/components/order-detail/OrderGeneral'
import OrderStatusTracking from '@/components/order-detail/OrderStatusTracking'
import OrderStatusTrackingDetail from '@/components/order-detail/OrderStatusTrackingDetail'
import OrderSummary from '@/components/order-detail/OrderSummary'
import OrderStatus from '@/components/order-status'
import { myTheme } from '@/constants'
import { useToast } from '@/contexts/ToastContext'
import { getMasterConfigApi } from '@/hooks/api/master-config'
import {
  getCancelAndReturnRequestApi,
  getOrderByIdApi,
  getStatusTrackingByIdApi,
  updateOrderStatusApi
} from '@/hooks/api/order'
import useHandleServerError from '@/hooks/useHandleServerError'
import { RequestStatusEnum, ShippingStatusEnum } from '@/types/enum'
import { millisecondsToRoundedDays } from '@/utils/time'

const OrderDetail = () => {
  const { id } = useLocalSearchParams()
  const router = useRouter()
  console.log('id', id)
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [openCancelOrderDialog, setOpenCancelOrderDialog] = useState<boolean>(false)
  const [openRequestCancelOrderDialog, setOpenRequestCancelOrderDialog] = useState<boolean>(false)
  const [isTrigger, setIsTrigger] = useState<boolean>(false)
  const [openReqReturnDialog, setOpenReqReturnDialog] = useState<boolean>(false)
  const [openTrackRequest, setOpenTrackRequest] = useState<boolean>(false)
  const [openTrackComplaint, setOpenTrackComplaint] = useState<boolean>(false)
  const { showToast } = useToast()
  const handleServerError = useHandleServerError()
  const [isLoading, setIsLoading] = useState(false)

  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const toggleModalVisibility = () => {
    if (openCancelOrderDialog) {
      bottomSheetModalRef.current?.close() // Close modal if it's visible
    } else {
      bottomSheetModalRef.current?.present() // Open modal if it's not visible
    }
    setOpenCancelOrderDialog(!openCancelOrderDialog) // Toggle the state
  }
  const bottomSheetModalRequestCancelRef = useRef<BottomSheetModal>(null)
  const toggleModalRequestCancelVisibility = () => {
    if (openRequestCancelOrderDialog) {
      bottomSheetModalRequestCancelRef.current?.close() // Close modal if it's visible
    } else {
      bottomSheetModalRequestCancelRef.current?.present() // Open modal if it's not visible
    }
    setOpenRequestCancelOrderDialog(!openRequestCancelOrderDialog) // Toggle the state
  }
  const bottomSheetModalRequestReturnRef = useRef<BottomSheetModal>(null)
  const toggleModalRequestReturnVisibility = () => {
    if (openReqReturnDialog) {
      bottomSheetModalRequestReturnRef.current?.close() // Close modal if it's visible
    } else {
      bottomSheetModalRequestReturnRef.current?.present() // Open modal if it's not visible
    }
    setOpenReqReturnDialog(!openReqReturnDialog) // Toggle the state
  }

  const { data: useOrderData, isFetching } = useQuery({
    queryKey: [getOrderByIdApi.queryKey, (id as string) ?? ('' as string)],
    queryFn: getOrderByIdApi.fn
  })

  const { data: useStatusTrackingData, isFetching: isFetchingStatusTracking } = useQuery({
    queryKey: [getStatusTrackingByIdApi.queryKey, (id as string) ?? ('' as string)],
    queryFn: getStatusTrackingByIdApi.fn,
    enabled: !!id
  })
  const { data: masterConfig } = useQuery({
    queryKey: [getMasterConfigApi.queryKey],
    queryFn: getMasterConfigApi.fn
  })

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: [getOrderByIdApi.queryKey]
    })
  }, [isTrigger, queryClient])

  const { data: cancelAndReturnRequestData } = useQuery({
    queryKey: [getCancelAndReturnRequestApi.queryKey, (id as string) ?? ('' as string)],
    queryFn: getCancelAndReturnRequestApi.fn,
    enabled: !!id
  })

  const { mutateAsync: updateOrderStatusFn } = useMutation({
    mutationKey: [updateOrderStatusApi.mutationKey],
    mutationFn: updateOrderStatusApi.fn,
    onSuccess: async () => {
      showToast(t('order.receivedOrderStatusSuccess'), 'success', 4000)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [getOrderByIdApi.queryKey] }),
        queryClient.invalidateQueries({
          queryKey: [getStatusTrackingByIdApi.queryKey]
        })
      ])
    }
  })
  async function handleUpdateStatus(values: string) {
    try {
      setIsLoading(true)
      await updateOrderStatusFn({
        id: useOrderData?.data?.id ?? '',
        status: values
      })
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
      handleServerError({
        error
      })
    }
  }

  const showReturnButton = useMemo(() => {
    const isOrderDeliveredRecently = () => {
      const deliveredStatusTrack = useStatusTrackingData?.data?.find(
        (track) => track.status === ShippingStatusEnum.DELIVERED
      )

      if (!deliveredStatusTrack?.createdAt) return false

      const deliveredDate = new Date(deliveredStatusTrack.createdAt)
      const currentDate = new Date()
      const allowedTimeInMs = masterConfig?.data[0].refundTimeExpired
        ? parseInt(masterConfig?.data[0].refundTimeExpired)
        : null
      return allowedTimeInMs ? currentDate.getTime() - deliveredDate.getTime() <= allowedTimeInMs : true
    }
    return (
      (useOrderData?.data?.status === ShippingStatusEnum.DELIVERED ||
        useOrderData?.data?.status === ShippingStatusEnum.COMPLETED) &&
      !cancelAndReturnRequestData?.data?.refundRequest &&
      isOrderDeliveredRecently()
    )
  }, [
    cancelAndReturnRequestData?.data?.refundRequest,
    masterConfig?.data,
    useOrderData?.data?.status,
    useStatusTrackingData?.data
  ])
  const showReceivedButton = useMemo(() => {
    const isOrderDeliveredRecently = () => {
      const deliveredStatusTrack = useStatusTrackingData?.data?.find(
        (track) => track.status === ShippingStatusEnum.DELIVERED
      )

      if (!deliveredStatusTrack?.createdAt) return false

      const deliveredDate = new Date(deliveredStatusTrack.createdAt)
      const currentDate = new Date()

      const allowedTimeInMs = masterConfig?.data[0].expiredCustomerReceivedTime
        ? parseInt(masterConfig?.data[0].expiredCustomerReceivedTime)
        : null
      return allowedTimeInMs ? currentDate.getTime() - deliveredDate.getTime() <= allowedTimeInMs : true
    }
    return (
      useOrderData?.data?.status === ShippingStatusEnum.DELIVERED &&
      !cancelAndReturnRequestData?.data?.refundRequest &&
      isOrderDeliveredRecently()
    )
  }, [
    cancelAndReturnRequestData?.data?.refundRequest,
    masterConfig?.data,
    useOrderData?.data?.status,
    useStatusTrackingData?.data
  ])
  const pendingRequestCancelTime = useMemo(() => {
    return millisecondsToRoundedDays(parseInt(masterConfig?.data[0].autoApprovedRequestCancelTime ?? ''))
  }, [masterConfig?.data])

  const pendingRequestReturnTime = useMemo(() => {
    return (
      millisecondsToRoundedDays(parseInt(masterConfig?.data[0].autoApproveRefundRequestTime ?? '')) +
      ' - ' +
      millisecondsToRoundedDays(
        parseInt(masterConfig?.data[0].autoApproveRefundRequestTime ?? '') +
          parseInt(masterConfig?.data[0].pendingAdminCheckRejectRefundRequestTime ?? '')
      )
    )
  }, [masterConfig?.data])
  const pendingCustomerShippingReturnTime = useMemo(() => {
    return millisecondsToRoundedDays(parseInt(masterConfig?.data[0].pendingCustomerShippingReturnTime ?? ''))
  }, [masterConfig?.data])
  return (
    <View style={!isFetching && !useOrderData?.data ? styles.emptyContainer : styles.container}>
      <Stack.Screen
        options={{
          header: () => (
            <Header
              headerLeft={() => (
                <HeaderBackButton
                  label='Quay lại'
                  tintColor={myTheme.primary}
                  labelStyle={{
                    fontWeight: 'bold',
                    color: myTheme.primary,
                    backgroundColor: myTheme.primary
                  }}
                  onPress={() => router.back()}
                />
              )}
              title={
                useOrderData?.data?.id
                  ? t('orderDetail.title') + ' ' + `#${useOrderData?.data?.id?.substring(0, 8).toUpperCase()}`
                  : t('orderDetail.title')
              }
              headerTitleStyle={{
                fontWeight: 'bold',
                color: myTheme.primary
              }}
            />
          )
        }}
      />

      {isFetching && <LoadingContentLayer />}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          {/* <View style={styles.titleContainer}>
            <MyText
              text={t("orderDetail.title")}
              styleProps={styles.titleText}
            />
           
          </View> */}
          {!isFetching && useOrderData?.data && (
            <View style={styles.statusContainer}>
              <MyText text={`${t('orderDetail.status')}: `} styleProps={styles.statusLabelText} />
              <OrderStatus tag={useOrderData?.data?.status ?? ''} size='small' />
            </View>
          )}
        </View>

        {!isFetching && useOrderData && useOrderData?.data && (
          <View style={styles.contentContainer}>
            {/* order status tracking */}
            {!isFetchingStatusTracking && useStatusTrackingData && useStatusTrackingData?.data && (
              <OrderStatusTracking statusTrackingData={useStatusTrackingData?.data} />
            )}

            {/* cancel request information */}
            {!isLoading && cancelAndReturnRequestData?.data?.cancelRequest?.status === RequestStatusEnum.PENDING && (
              <AlertMessage
                title={t('order.cancelRequestPendingTitle')}
                message={t('order.cancelRequestPendingMessage', {
                  count: pendingRequestCancelTime
                })}
                isShowIcon={false}
                style={styles.alertMessage}
              />
            )}
            {!isLoading && cancelAndReturnRequestData?.data?.cancelRequest?.status === RequestStatusEnum.REJECTED && (
              <AlertMessage
                style={styles.dangerAlertMessage}
                color='danger'
                isShowIcon={false}
                title={t('order.cancelRequestRejectedTitle')}
                message={t('order.cancelRequestRejectedMessage')}
              />
            )}

            {/* return request information */}
            {!isLoading &&
              cancelAndReturnRequestData?.data?.complaintRequest?.status === RequestStatusEnum.APPROVED && (
                <AlertMessage
                  title={t('return.complaintRequestApprovedTitleCustomer')}
                  message={t('return.complaintRequestApprovedMessageCustomer')}
                  isShowIcon={false}
                  color='warn'
                  buttonText='view'
                  buttonStyle={styles.warnButton}
                  onPress={() => setOpenTrackComplaint(true)}
                />
              )}
            {!isLoading &&
              (cancelAndReturnRequestData?.data?.refundRequest?.status === RequestStatusEnum.PENDING ||
                (cancelAndReturnRequestData?.data?.refundRequest?.status === RequestStatusEnum.REJECTED &&
                  cancelAndReturnRequestData?.data?.refundRequest?.rejectedRefundRequest?.status ===
                    RequestStatusEnum.PENDING)) && (
                <AlertMessage
                  title={t('return.returnRequestPendingTitleCustomer')}
                  message={t('return.returnRequestPendingMessageCustomer', {
                    string: `${pendingRequestReturnTime}`
                  })}
                  isShowIcon={false}
                  buttonText='view'
                  buttonStyle={styles.warnButton}
                  onPress={() => setOpenTrackRequest(true)}
                />
              )}
            {!isLoading &&
              cancelAndReturnRequestData?.data?.refundRequest?.status === RequestStatusEnum.REJECTED &&
              cancelAndReturnRequestData?.data?.refundRequest?.rejectedRefundRequest?.status ===
                RequestStatusEnum.APPROVED && (
                <AlertMessage
                  color='danger'
                  isShowIcon={false}
                  title={t('return.returnRequestRejectedTitleCustomer')}
                  message={t('return.returnRequestRejectedMessageCustomer')}
                  buttonText='view'
                  onPress={() => setOpenTrackRequest(true)}
                />
              )}
            {!isLoading &&
              (cancelAndReturnRequestData?.data?.refundRequest?.status === RequestStatusEnum.APPROVED ||
                (cancelAndReturnRequestData?.data?.refundRequest?.status === RequestStatusEnum.REJECTED &&
                  cancelAndReturnRequestData?.data?.refundRequest?.rejectedRefundRequest?.status ===
                    RequestStatusEnum.REJECTED)) &&
              useOrderData.data.status !== ShippingStatusEnum.DELIVERED &&
              useOrderData.data.status !== ShippingStatusEnum.COMPLETED && (
                <AlertMessage
                  title={t('order.returnRequestApprovedTitle')}
                  message={t('return.returnRequestApprovedView')}
                  isShowIcon={false}
                  color='success'
                  buttonText='view'
                  onPress={() => setOpenTrackRequest(true)}
                  buttonStyle={styles.successButton}
                />
              )}

            {!isLoading &&
              (cancelAndReturnRequestData?.data?.refundRequest?.status === RequestStatusEnum.APPROVED ||
                (cancelAndReturnRequestData?.data?.refundRequest?.status === RequestStatusEnum.REJECTED &&
                  cancelAndReturnRequestData?.data?.refundRequest?.rejectedRefundRequest?.status ===
                    RequestStatusEnum.REJECTED)) &&
              (useOrderData.data.status === ShippingStatusEnum.DELIVERED ||
                useOrderData.data.status === ShippingStatusEnum.COMPLETED) && (
                <ReturnOrderSection
                  orderId={useOrderData?.data?.id}
                  pendingCustomerShippingReturnTime={pendingCustomerShippingReturnTime}
                />
              )}

            {/* order customer timeline, information, shipment */}
            <View style={styles.infoSection}>
              <View style={styles.timelineSection}>
                <OrderGeneral
                  title={t('orderDetail.timeline')}
                  icon={<Octicons name='history' size={24} color={myTheme.muted} />}
                  content={
                    !isFetchingStatusTracking && useStatusTrackingData && useStatusTrackingData?.data ? (
                      <OrderStatusTrackingDetail statusTrackingData={useStatusTrackingData?.data} />
                    ) : (
                      <MyText text='' />
                    )
                  }
                />
              </View>
              <View style={styles.addressSection}>
                <OrderGeneral
                  title={t('orderDetail.shippingAddress')}
                  icon={<Feather name='truck' size={24} color={myTheme.muted} />}
                  content={
                    <View style={styles.addressContent}>
                      <View style={styles.addressRow}>
                        <MyText text={`${t('orderDetail.recipientName')}: `} styleProps={styles.addressLabel} />
                        <MyText text={useOrderData?.data?.recipientName} styleProps={styles.addressText} />
                      </View>
                      <View style={styles.addressRow}>
                        <MyText text={`${t('orderDetail.address')}: `} styleProps={styles.addressLabel} />
                        <MyText text={useOrderData?.data?.shippingAddress} styleProps={styles.addressText} />
                      </View>
                      <View style={styles.addressRow}>
                        <MyText text={`${t('orderDetail.phone')}: `} styleProps={styles.addressLabel} />
                        <MyText text={useOrderData?.data?.phone} styleProps={styles.addressText} />
                      </View>
                      <View style={styles.addressRow}>
                        <MyText text={`${t('orderDetail.notes')}: `} styleProps={styles.addressLabel} />
                        <MyText
                          text={useOrderData?.data?.notes ?? t('orderDetail.no')}
                          styleProps={styles.addressText}
                        />
                      </View>
                    </View>
                  }
                />

                <OrderGeneral
                  title={t('orderDetail.message')}
                  icon={<MaterialIcons name='message' size={24} color={myTheme.mutedForeground} />}
                  content={
                    <View style={styles.messageRow}>
                      <MyText text={`${t('orderDetail.message')}: `} styleProps={styles.addressLabel} />
                      <MyText
                        text={
                          useOrderData?.data?.message && useOrderData?.data?.message !== ''
                            ? useOrderData?.data?.message
                            : t('orderDetail.no')
                        }
                        styleProps={styles.addressText}
                      />
                    </View>
                  }
                />
              </View>
            </View>

            <View style={styles.orderDetails}>
              {/* brand */}
              <BrandOrderInformation
                brandId={
                  (
                    useOrderData?.data?.orderDetails?.[0]?.productClassification?.preOrderProduct ??
                    useOrderData?.data?.orderDetails?.[0]?.productClassification?.productDiscount ??
                    useOrderData?.data?.orderDetails?.[0]?.productClassification
                  )?.product?.brand?.id ?? ''
                }
                brandName={
                  (
                    useOrderData?.data?.orderDetails?.[0]?.productClassification?.preOrderProduct ??
                    useOrderData?.data?.orderDetails?.[0]?.productClassification?.productDiscount ??
                    useOrderData?.data?.orderDetails?.[0]?.productClassification
                  )?.product?.brand?.name ?? 'Brand'
                }
                brandLogo={
                  (
                    useOrderData?.data?.orderDetails?.[0]?.productClassification?.preOrderProduct ??
                    useOrderData?.data?.orderDetails?.[0]?.productClassification?.productDiscount ??
                    useOrderData?.data?.orderDetails?.[0]?.productClassification
                  )?.product?.brand?.logo ?? 'Brand'
                }
              />

              {/* order items */}
              <OrderDetailItems
                orderDetails={useOrderData?.data?.orderDetails}
                status={useOrderData?.data?.status}
                brand={
                  (
                    useOrderData?.data?.orderDetails?.[0]?.productClassification?.preOrderProduct ??
                    useOrderData?.data?.orderDetails?.[0]?.productClassification?.productDiscount ??
                    useOrderData?.data?.orderDetails?.[0]?.productClassification
                  )?.product?.brand ?? null
                }
                accountAvatar={useOrderData?.data?.account?.avatar ?? ''}
                accountName={useOrderData?.data?.account?.username ?? ''}
                masterConfig={masterConfig?.data}
                statusTracking={useStatusTrackingData?.data}
              />

              {/* order summary */}
              <OrderSummary
                totalProductCost={useOrderData?.data?.subTotal}
                totalBrandDiscount={useOrderData?.data?.shopVoucherDiscount}
                totalPlatformDiscount={useOrderData?.data?.platformVoucherDiscount}
                totalPayment={useOrderData?.data?.totalPrice}
                paymentMethod={useOrderData?.data?.paymentMethod}
              />

              {useOrderData?.data?.status === ShippingStatusEnum.WAIT_FOR_CONFIRMATION && (
                <TouchableOpacity style={styles.outlineButton} onPress={() => setOpenCancelOrderDialog(true)}>
                  <MyText text={t('order.cancelOrder')} styleProps={styles.outlineButtonText} />
                </TouchableOpacity>
              )}

              <View style={styles.buttonGroup}>
                {useOrderData?.data?.status === ShippingStatusEnum.PREPARING_ORDER &&
                  !cancelAndReturnRequestData?.data?.cancelRequest && (
                    <TouchableOpacity
                      style={styles.outlineButton}
                      onPress={() => setOpenRequestCancelOrderDialog(true)}
                    >
                      <MyText text={t('order.cancelOrder')} styleProps={styles.outlineButtonText} />
                    </TouchableOpacity>
                  )}
                {showReceivedButton && (
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => {
                      handleUpdateStatus(ShippingStatusEnum.COMPLETED)
                    }}
                  >
                    {isLoading ? (
                      <LoadingIcon color='primaryBackground' />
                    ) : (
                      <MyText text={t('order.received')} styleProps={styles.primaryButtonText} />
                    )}
                  </TouchableOpacity>
                )}
                {showReturnButton && (
                  <TouchableOpacity style={styles.outlineButton} onPress={() => setOpenReqReturnDialog(true)}>
                    <MyText text={t('order.returnOrder')} styleProps={styles.outlineButtonText} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}
        {!isFetching && (!useOrderData || !useOrderData?.data) && (
          <View style={[styles.loadingContainer, styles.marginAuto]}>
            <Empty
              title={t('empty.orderDetail.title')}
              description={t('empty.orderDetail.description')}
              link='/(app)/(profile)/orders'
              linkText={t('empty.orderDetail.button')}
            />
          </View>
        )}
      </ScrollView>

      {!isFetching && useOrderData?.data && (
        <CancelOrderDialog
          bottomSheetModalRef={bottomSheetModalRef}
          setIsModalVisible={setOpenCancelOrderDialog}
          toggleModalVisibility={toggleModalVisibility}
          onOpenChange={setOpenCancelOrderDialog}
          setIsTrigger={setIsTrigger}
          orderId={useOrderData?.data?.id ?? ''}
        />
      )}
      {!isFetching && useOrderData?.data && (
        <RequestCancelOrderDialog
          bottomSheetModalRef={bottomSheetModalRequestCancelRef}
          setIsModalVisible={setOpenRequestCancelOrderDialog}
          toggleModalVisibility={toggleModalRequestCancelVisibility}
          onOpenChange={setOpenRequestCancelOrderDialog}
          orderId={useOrderData?.data?.id ?? ''}
          setIsTrigger={setIsTrigger}
        />
      )}
      {!isFetching && useOrderData?.data && (
        <RequestReturnOrderDialog
          bottomSheetModalRef={bottomSheetModalRequestReturnRef}
          setIsModalVisible={setOpenReqReturnDialog}
          toggleModalVisibility={toggleModalRequestReturnVisibility}
          setIsTrigger={setIsTrigger}
          orderId={useOrderData?.data?.id ?? ''}
        />
      )}
      {!isFetching && useOrderData?.data && cancelAndReturnRequestData?.data?.refundRequest && (
        <ConfirmDecisionDialog
          open={openTrackRequest}
          onOpenChange={setOpenTrackRequest}
          item='returnTrackView'
          rejectReason={cancelAndReturnRequestData?.data?.refundRequest?.rejectedRefundRequest?.reason}
          rejectMediaFiles={cancelAndReturnRequestData?.data?.refundRequest?.rejectedRefundRequest?.mediaFiles}
          reason={cancelAndReturnRequestData?.data?.refundRequest.reason}
          mediaFiles={cancelAndReturnRequestData?.data?.refundRequest.mediaFiles}
          isRejectRequest={cancelAndReturnRequestData?.data?.refundRequest?.rejectedRefundRequest !== null}
          status={cancelAndReturnRequestData?.data?.refundRequest?.status}
          rejectStatus={cancelAndReturnRequestData?.data?.refundRequest?.rejectedRefundRequest?.status}
          reasonRejected={cancelAndReturnRequestData?.data?.refundRequest?.rejectedRefundRequest?.reasonRejected}
          rejectTime={cancelAndReturnRequestData?.data?.refundRequest?.rejectedRefundRequest?.createdAt}
          reviewTime={cancelAndReturnRequestData?.data?.refundRequest?.rejectedRefundRequest?.updatedAt}
          returnTime={cancelAndReturnRequestData?.data?.refundRequest?.createdAt}
        />
      )}
      {!isFetching && useOrderData?.data && cancelAndReturnRequestData?.data?.complaintRequest && (
        <ConfirmDecisionDialog
          open={openTrackComplaint}
          onOpenChange={setOpenTrackComplaint}
          item='complaintTrackView'
          rejectReason=''
          rejectMediaFiles={[]}
          reason={cancelAndReturnRequestData?.data?.complaintRequest?.reason}
          mediaFiles={cancelAndReturnRequestData?.data?.complaintRequest?.mediaFiles}
          isRejectRequest={false}
          rejectStatus={cancelAndReturnRequestData?.data?.complaintRequest?.status}
          status={cancelAndReturnRequestData?.data?.complaintRequest?.status}
          reasonRejected={cancelAndReturnRequestData?.data?.complaintRequest?.reasonRejected}
          reviewTime={cancelAndReturnRequestData?.data?.complaintRequest?.updatedAt}
          returnTime={cancelAndReturnRequestData?.data?.complaintRequest.createdAt}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    flexDirection: 'column',
    alignContent: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: myTheme.background
  },
  marginAuto: {
    margin: 'auto'
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  },
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: myTheme.background
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 20
  },
  headerContainer: {
    width: '100%',
    marginBottom: 24,
    flexDirection: 'column'
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  titleText: {
    fontSize: 18,
    fontWeight: '500',
    color: myTheme.mutedForeground,
    marginRight: 4
  },
  orderIdText: {
    fontSize: 18,
    color: myTheme.mutedForeground
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 'auto'
  },
  statusLabelText: {
    fontSize: 16,
    fontWeight: '500',
    color: myTheme.mutedForeground
  },
  contentContainer: {
    width: '100%',
    gap: 10
  },
  alertMessage: {
    width: '100%'
  },
  dangerAlertMessage: {
    backgroundColor: myTheme.red[100]
  },
  warnButton: {
    backgroundColor: myTheme.yellow[500]
  },
  successButton: {
    backgroundColor: myTheme.green[500]
  },
  infoSection: {
    flexDirection: 'column',
    width: '100%'
  },
  timelineSection: {
    width: '100%'
  },
  addressSection: {
    width: '100%'
  },
  addressContent: {
    gap: 4
  },
  addressRow: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  messageRow: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  addressLabel: {
    fontWeight: '500',
    fontSize: 14
  },
  addressText: {
    fontSize: 14
  },
  orderDetails: {
    gap: 8
  },
  outlineButton: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: myTheme.primary,
    borderRadius: 6,
    marginTop: 8
  },
  outlineButtonText: {
    color: myTheme.primary,
    fontWeight: '500'
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: myTheme.primary,
    borderRadius: 6
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: '500'
  }
})
export default OrderDetail
