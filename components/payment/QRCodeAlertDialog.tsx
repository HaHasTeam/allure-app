'use client'

import { Feather } from '@expo/vector-icons'
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { Button } from 'react-native-ui-lib'

import { QRCodePayment } from './QRCodePayment'

import { myTheme } from '@/constants'
import { payTransactionApi } from '@/hooks/api/transaction'
import { formatCurrency } from '@/utils/number'
import type { PAY_TYPE } from '@/hooks/api/transaction/type'

interface QRCodeAlertDialogProps {
  /**
   * Controls whether the dialog is open
   */
  open: boolean
  /**
   * Callback for when the open state changes
   */
  onOpenChange: (open: boolean) => void
  /**
   * Amount to pay in VND
   */
  amount: number
  paymentId?: string
  description?: string
  /**
   * Optional title for the dialog
   */
  title?: string
  type: PAY_TYPE
  onSuccess?: () => void
  onClose?: () => void
}

export function QRCodeAlertDialog({
  open,
  onOpenChange,
  amount,
  description = 'Payment',
  paymentId,
  title,
  type,
  onSuccess,
  onClose
}: QRCodeAlertDialogProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'error'>('pending')
  const [paymentId_result, setPaymentId_result] = useState<string | null>(null)
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const [userDismissed, setUserDismissed] = useState(false)
  const [browserOpened, setBrowserOpened] = useState(false)

  const { mutateAsync: payTransaction, isPending } = useMutation({
    mutationKey: [payTransactionApi.mutationKey],
    mutationFn: payTransactionApi.fn
  })

  // Reset payment state when dialog is opened
  useEffect(() => {
    if (open) {
      setPaymentStatus('pending')
      setPaymentId_result(null)
      setUserDismissed(false)
      setBrowserOpened(false)
      bottomSheetModalRef.current?.present()
    } else {
      bottomSheetModalRef.current?.dismiss()
    }
  }, [open])

  // Handle payment success
  const handleSuccess = async (paymentOSId: string) => {
    try {
      setPaymentStatus('processing')
      setPaymentId_result(paymentOSId)

      if (paymentId) {
        await payTransaction({ orderId: paymentOSId, id: paymentId, type })
      }

      setPaymentStatus('success')
      onSuccess?.()
    } catch (error) {
      console.error('Payment processing error:', error)
      setPaymentStatus('error')
    }
  }

  // Handle payment error
  const handleError = (error: Error | unknown) => {
    console.log('handleError 102: ', error)
    setPaymentStatus('error')
  }

  // Handle browser closed without completing payment
  const handleBrowserClosed = () => {
    // We don't immediately set to error, as the payment might still be processing
    console.log('Browser closed, payment status unknown')
  }

  // Handle browser opened
  const handleBrowserOpened = () => {
    setBrowserOpened(true)
  }

  const handleClose = () => {
    onOpenChange(false)
    onClose?.()
  }

  // Render backdrop component
  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    []
  )

  // Handle sheet changes
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        // Bottom sheet was dismissed
        setUserDismissed(true)
        onOpenChange(false)

        // If browser was opened but payment wasn't completed successfully,
        // redirect to order history
        if (browserOpened && paymentStatus !== 'success') {
          // Small delay to ensure the bottom sheet is fully closed
          setTimeout(() => {
            router.push('/(profile)/orders/orderhistory')
          }, 300)
        }
      }
    },
    [onOpenChange, browserOpened, paymentStatus, router]
  )

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={['85%']}
      enablePanDownToClose={true}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.handleIndicator}
      onChange={handleSheetChanges}
      backgroundStyle={styles.bottomSheetBackground}
    >
      <BottomSheetView style={styles.container}>
        {/* Header area */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>{title || t('wallet.scanAndPay')}</Text>
            <Text style={styles.subtitle}>{t('wallet.scanToPayDescription')}</Text>
          </View>
          {paymentStatus !== 'pending' && paymentStatus !== 'processing' && (
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Feather name='x' size={20} color={myTheme.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        {/* Content area */}
        <View style={styles.contentArea}>
          {/* Pending state - Show payment options */}
          {paymentStatus === 'pending' && (
            <QRCodePayment
              amount={amount}
              description={description}
              paymentId={paymentId}
              onSuccess={handleSuccess}
              onError={handleError}
              onBrowserClosed={handleBrowserClosed}
              onBrowserOpened={handleBrowserOpened}
            />
          )}

          {/* Processing state */}
          {paymentStatus === 'processing' && (
            <View style={styles.processingContainer}>
              <View style={styles.loadingIndicator}>
                <ActivityIndicator size='large' color={myTheme.primary} />
              </View>
              <Text style={styles.processingText}>{t('wallet.verifyingPayment')}</Text>
              <Text style={styles.processingSubtext}>{t('wallet.pleaseWait')}</Text>

              <View style={styles.processingDetailsCard}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t('wallet.amount')}:</Text>
                  <Text style={styles.detailValue}>{formatCurrency(amount)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t('wallet.paymentMethod')}:</Text>
                  <Text style={styles.detailValue}>{t('wallet.BANK_TRANSFER')}</Text>
                </View>
                {paymentId_result && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{t('wallet.transactionId')}:</Text>
                    <Text style={styles.detailValueMono} numberOfLines={1} ellipsizeMode='middle'>
                      {paymentId_result}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Success state */}
          {paymentStatus === 'success' && (
            <View style={styles.resultContainer}>
              <View style={styles.successIconContainer}>
                <View style={styles.successIconOuter}>
                  <View style={styles.successIconInner}>
                    <Feather name='check' size={36} color={myTheme.white} />
                  </View>
                </View>
              </View>

              <Text style={styles.successTitle}>{t('wallet.paymentSuccessful')}</Text>
              <Text style={styles.successSubtitle}>{t('wallet.transactionCompleted')}</Text>

              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t('wallet.amount')}:</Text>
                  <Text style={styles.detailValue}>{formatCurrency(amount)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{t('wallet.paymentMethod')}:</Text>
                  <Text style={styles.detailValue}>{t('wallet.BANK_TRANSFER')}</Text>
                </View>
                {paymentId_result && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{t('wallet.transactionId')}:</Text>
                    <Text style={styles.detailValueMono} numberOfLines={1} ellipsizeMode='middle'>
                      {paymentId_result}
                    </Text>
                  </View>
                )}
              </View>

              <Button
                label={t('wallet.close')}
                backgroundColor={myTheme.primary}
                style={styles.actionButton}
                onPress={handleClose}
              />
            </View>
          )}

          {/* Error state */}
          {paymentStatus === 'error' && (
            <View style={styles.resultContainer}>
              <View style={styles.errorIconContainer}>
                <View style={styles.errorIconOuter}>
                  <View style={styles.errorIconInner}>
                    <Feather name='x' size={36} color={myTheme.white} />
                  </View>
                </View>
              </View>

              <Text style={styles.errorTitle}>{t('wallet.paymentError')}</Text>
              <Text style={styles.errorSubtitle}>{t('wallet.paymentFailed')}</Text>
            </View>
          )}
        </View>

        {/* Footer area - only shown in pending state */}
        {paymentStatus === 'pending' && (
          <View style={styles.footer}>
            <View style={styles.footerContent}>
              <Text style={styles.footerLabel}>{t('wallet.amount')}</Text>
              <Text style={styles.footerAmount}>{formatCurrency(amount)}</Text>
            </View>
          </View>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: myTheme.white
  },
  bottomSheetBackground: {
    backgroundColor: myTheme.white
  },
  handleIndicator: {
    width: 40,
    height: 4,
    backgroundColor: myTheme.muted,
    alignSelf: 'center'
  },
  header: {
    padding: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: myTheme.border
  },
  headerContent: {
    flex: 1
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    color: myTheme.foreground,
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: myTheme.mutedForeground
  },
  closeButton: {
    height: 32,
    width: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: myTheme.muted
  },
  contentArea: {
    flex: 1
  },
  // Processing state styles
  processingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24
  },
  loadingIndicator: {
    marginBottom: 24
  },
  processingText: {
    fontSize: 20,
    fontWeight: '600',
    color: myTheme.foreground,
    marginBottom: 8,
    textAlign: 'center'
  },
  processingSubtext: {
    fontSize: 16,
    color: myTheme.mutedForeground,
    marginBottom: 32,
    textAlign: 'center'
  },
  processingDetailsCard: {
    width: '100%',
    backgroundColor: myTheme.lightGrey || myTheme.background,
    borderRadius: 12,
    padding: 16,
    marginTop: 16
  },
  // Success state styles
  resultContainer: {
    padding: 24,
    flex: 1,
    alignItems: 'center'
  },
  successIconContainer: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  successIconOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  successIconInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: myTheme.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: myTheme.foreground,
    marginBottom: 8,
    textAlign: 'center'
  },
  successSubtitle: {
    fontSize: 16,
    color: myTheme.mutedForeground,
    marginBottom: 32,
    textAlign: 'center'
  },
  // Error state styles
  errorIconContainer: {
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  errorIconOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  errorIconInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: myTheme.destructive,
    alignItems: 'center',
    justifyContent: 'center'
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: myTheme.destructive,
    marginBottom: 8,
    textAlign: 'center'
  },
  errorSubtitle: {
    fontSize: 16,
    color: myTheme.mutedForeground,
    marginBottom: 32,
    textAlign: 'center'
  },
  // Common styles
  detailsContainer: {
    width: '100%',
    backgroundColor: myTheme.lightGrey || myTheme.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  detailLabel: {
    fontSize: 14,
    color: myTheme.mutedForeground
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: myTheme.foreground,
    maxWidth: '60%',
    textAlign: 'right'
  },
  detailValueMono: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: myTheme.foreground,
    maxWidth: '60%',
    textAlign: 'right'
  },
  actionButton: {
    width: '100%'
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 16
  },
  buttonHalf: {
    flex: 1,
    marginHorizontal: 4
  },
  buttonLabelOutline: {
    color: myTheme.foreground
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: myTheme.border
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  footerLabel: {
    fontSize: 14,
    color: myTheme.mutedForeground
  },
  footerAmount: {
    fontSize: 20,
    fontWeight: '600',
    color: myTheme.foreground
  },
  footerActions: {
    marginTop: 12
  },
  viewOrdersButton: {
    alignSelf: 'center',
    marginTop: 8
  },
  viewOrdersLabel: {
    color: myTheme.primary,
    fontSize: 14
  }
})
