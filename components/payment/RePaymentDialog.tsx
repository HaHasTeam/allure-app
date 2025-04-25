import { Entypo, Feather } from '@expo/vector-icons'
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { type Dispatch, type SetStateAction, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { Button, Card, RadioButton, RadioGroup, Text } from 'react-native-ui-lib'
import type { z } from 'zod'

import CreateWalletBtn from './CreateWalletBtn'
import TopUpModal from './TopUpModal'

import { myTheme } from '@/constants'
import { useToast } from '@/contexts/ToastContext'
import { filterOrdersParentApi, getParentOrderByIdApi, updateOrderPaymentMethod } from '@/hooks/api/order'
import { payTransactionApi } from '@/hooks/api/transaction'
import { PAY_TYPE } from '@/hooks/api/transaction/type'
import { getMyWalletApi } from '@/hooks/api/wallet'
import useHandleServerError from '@/hooks/useHandleServerError'
import { getUpdatePaymentMethodSchema } from '@/schema/order.schema'
import { PaymentMethod } from '@/types/enum'
import type { PaymentMethodEnum } from '@/types/payment'

interface RePaymentDialogProps {
  totalPayment: number
  paymentMethod: PaymentMethod
  setIsOpenQRCodePayment: Dispatch<SetStateAction<boolean>>
  setPaymentId: Dispatch<SetStateAction<string | undefined>>
  orderId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  setIsChangePaymentMethod: Dispatch<SetStateAction<boolean>>
}

export default function RePaymentDialog({
  orderId,
  setPaymentId,
  setIsOpenQRCodePayment,
  totalPayment,
  paymentMethod,
  open,
  onOpenChange,
  setIsChangePaymentMethod
}: RePaymentDialogProps) {
  const { t } = useTranslation()
  const UpdatePaymentMethodSchema = getUpdatePaymentMethodSchema()
  const { showToast } = useToast()
  const handleServerError = useHandleServerError()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const queryClient = useQueryClient()
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const [topUpModalVisible, setTopUpModalVisible] = useState(false)

  // Effect to handle opening/closing the bottom sheet
  useEffect(() => {
    if (open) {
      bottomSheetModalRef.current?.present()
    } else {
      bottomSheetModalRef.current?.dismiss()
    }
  }, [open])

  const { data: myWallet } = useQuery({
    queryKey: [getMyWalletApi.queryKey],
    queryFn: getMyWalletApi.fn
  })

  const { mutateAsync: payTransaction } = useMutation({
    mutationKey: [payTransactionApi.mutationKey],
    mutationFn: payTransactionApi.fn,
    onSuccess: () => {
      setIsLoading(false)
      onOpenChange(false)
      showToast(t('payment.paymentSuccess'), 'success')
      queryClient.invalidateQueries({
        queryKey: [filterOrdersParentApi.queryKey]
      })
      queryClient.invalidateQueries({
        queryKey: [getParentOrderByIdApi.queryKey]
      })
      queryClient.invalidateQueries({
        queryKey: [getMyWalletApi.queryKey]
      })
    },
    onError: (error) => {
      setIsLoading(false)
      onOpenChange(false)
      queryClient.invalidateQueries({
        queryKey: [filterOrdersParentApi.queryKey]
      })
      queryClient.invalidateQueries({
        queryKey: [getMyWalletApi.queryKey]
      })
      queryClient.invalidateQueries({
        queryKey: [getParentOrderByIdApi.queryKey]
      })
      handleServerError({ error })
    }
  })

  const defaultValues = {
    paymentMethod
  }

  const { control, handleSubmit, getValues } = useForm<z.infer<typeof UpdatePaymentMethodSchema>>({
    resolver: zodResolver(UpdatePaymentMethodSchema),
    defaultValues
  })

  const { mutateAsync: updatePaymentMethodFn } = useMutation({
    mutationKey: [updateOrderPaymentMethod.mutationKey],
    mutationFn: updateOrderPaymentMethod.fn,
    onSuccess: () => {
      if (getValues('paymentMethod') === PaymentMethod.BANK_TRANSFER) {
        setIsOpenQRCodePayment(true)
        setPaymentId(orderId)
        setIsLoading(false)
        return
      }
      if (getValues('paymentMethod') === PaymentMethod.WALLET) {
        if (orderId) {
          payTransaction({ orderId, id: orderId, type: PAY_TYPE.ORDER })
        }
        return
      }
      setIsChangePaymentMethod(true)
    }
  })

  const isWalletAvailable = myWallet?.data

  const isEnoughBalance = useMemo(() => {
    if (!isWalletAvailable) {
      return false
    }
    const availableBalance = myWallet?.data.availableBalance ?? 0
    return availableBalance >= totalPayment
  }, [myWallet, isWalletAvailable, totalPayment])

  const handleOpenTopUp = useCallback(() => {
    setTopUpModalVisible(true)
  }, [])

  const handleCloseTopUp = useCallback(() => {
    setTopUpModalVisible(false)
  }, [])

  // Render backdrop component
  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    []
  )

  // Handle sheet changes
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onOpenChange(false)
      }
    },
    [onOpenChange]
  )

  async function onSubmit(values: z.infer<typeof UpdatePaymentMethodSchema>) {
    try {
      console.log(values)
      if (paymentMethod !== values.paymentMethod) {
        setIsLoading(true)
        await updatePaymentMethodFn({ id: orderId, paymentMethod: values.paymentMethod as PaymentMethodEnum })
        onOpenChange(false)
      } else {
        setIsLoading(true)
        if (paymentMethod === PaymentMethod.BANK_TRANSFER) {
          setIsOpenQRCodePayment(true)
          setPaymentId(orderId)
          return
        }
        if (paymentMethod === PaymentMethod.WALLET) {
          if (orderId) {
            payTransaction({ orderId, id: orderId, type: PAY_TYPE.ORDER })
          }
        }
      }
    } catch (error) {
      setIsLoading(false)
      handleServerError({
        error
      })
    }
  }

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={['70%']}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.handleIndicator}
      onChange={handleSheetChanges}
      backgroundStyle={styles.bottomSheetBackground}
    >
      <BottomSheetView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('wallet.choosePaymentMethod')}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Controller
            control={control}
            name='paymentMethod'
            render={({ field: { onChange, value } }) => (
              <View style={styles.formField}>
                <RadioGroup initialValue={value} onValueChange={(val: string) => onChange(val)}>
                  {/* Wallet Payment Option */}
                  <Card style={[styles.methodCard, value === PaymentMethod.WALLET && styles.selectedMethodCard]}>
                    <View style={styles.methodRow}>
                      <RadioButton
                        value={PaymentMethod.WALLET}
                        disabled={!isWalletAvailable || !isEnoughBalance}
                        color={myTheme.primary}
                        style={styles.radioButton}
                        selected={value === PaymentMethod.WALLET}
                      />
                      <View style={styles.methodLabel}>
                        <View style={styles.methodLabelContent}>
                          <Feather name='credit-card' size={20} color={myTheme.primary} />
                          <View style={styles.methodLabelTextContainer}>
                            <Text
                              style={[
                                styles.methodLabelText,
                                (!isWalletAvailable || !isEnoughBalance) && styles.disabledText
                              ]}
                            >
                              {t('wallet.WALLET')}
                            </Text>
                            <View style={styles.balanceContainer}>
                              <Text style={styles.balanceLabel}>{t('walletTerm.balance')}:</Text>
                              <Text style={styles.balanceValue} numberOfLines={1} ellipsizeMode='tail'>
                                {t('format.currency', {
                                  value: myWallet?.data?.availableBalance ?? 0
                                })}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>
                      <View style={styles.actionContainer}>
                        {isWalletAvailable ? (
                          <Button
                            backgroundColor={myTheme.primary}
                            style={styles.topUpButton}
                            onPress={handleOpenTopUp}
                          >
                            <Entypo name='wallet' size={16} color={myTheme.white} style={styles.buttonIcon} />
                            <Text style={styles.buttonLabel}>{t('walletTerm.topUp')}</Text>
                          </Button>
                        ) : (
                          <CreateWalletBtn />
                        )}
                      </View>
                    </View>
                  </Card>

                  {/* Bank Transfer Option */}
                  <Card style={[styles.methodCard, value === PaymentMethod.BANK_TRANSFER && styles.selectedMethodCard]}>
                    <View style={styles.methodRow}>
                      <RadioButton
                        value={PaymentMethod.BANK_TRANSFER}
                        color={myTheme.primary}
                        style={styles.radioButton}
                        selected={value === PaymentMethod.BANK_TRANSFER}
                      />
                      <View style={styles.methodLabel}>
                        <View style={styles.methodLabelContent}>
                          <Feather name='maximize' size={20} color={myTheme.primary} />
                          <Text style={styles.methodLabelText}>{t('wallet.BANK_TRANSFER')}</Text>
                        </View>
                      </View>
                    </View>
                  </Card>
                </RadioGroup>
              </View>
            )}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            outline
            outlineColor={myTheme.primary}
            style={styles.cancelButton}
            labelStyle={styles.cancelButtonLabel}
            onPress={() => onOpenChange(false)}
            label={t('dialog.cancel')}
          />
          <Button
            backgroundColor={myTheme.primary}
            style={styles.submitButton}
            loading={isLoading}
            onPress={handleSubmit(onSubmit)}
            label={t('button.submit')}
          />
        </View>

        {/* TopUp Modal */}
        {topUpModalVisible && (
          <BottomSheetModal
            index={0}
            snapPoints={['85%']}
            enablePanDownToClose={false}
            backdropComponent={renderBackdrop}
            handleIndicatorStyle={styles.handleIndicator}
            backgroundStyle={styles.bottomSheetBackground}
          >
            <BottomSheetView style={styles.topUpContainer}>
              <TopUpModal onClose={handleCloseTopUp} />
            </BottomSheetView>
          </BottomSheetModal>
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
    borderBottomWidth: 1,
    borderBottomColor: myTheme.border
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: myTheme.foreground
  },
  content: {
    flex: 1,
    padding: 16
  },
  formField: {
    width: '100%'
  },
  methodCard: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: myTheme.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: myTheme.white
  },
  selectedMethodCard: {
    borderColor: myTheme.primary
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  radioButton: {
    marginRight: 8
  },
  methodLabel: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4
  },
  methodLabelContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  methodLabelTextContainer: {
    marginLeft: 8
  },
  methodLabelText: {
    fontWeight: '500',
    color: myTheme.foreground
  },
  disabledText: {
    opacity: 0.5
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  balanceLabel: {
    fontSize: 14,
    color: myTheme.mutedForeground,
    marginRight: 4
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: myTheme.primary,
    maxWidth: 180
  },
  actionContainer: {
    marginLeft: 'auto'
  },
  topUpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4
  },
  buttonLabel: {
    fontSize: 14,
    color: myTheme.white
  },
  buttonIcon: {
    marginRight: 4
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: myTheme.border,
    gap: 12
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: myTheme.primary,
    backgroundColor: 'transparent'
  },
  cancelButtonLabel: {
    color: myTheme.primary
  },
  submitButton: {
    backgroundColor: myTheme.primary
  },
  topUpContainer: {
    flex: 1
  }
})
