import { Feather, Entypo } from '@expo/vector-icons'
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet'
import { useQuery } from '@tanstack/react-query'
import React, { useMemo, useRef, useState, useCallback } from 'react'
import { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { RadioButton, RadioGroup, Card } from 'react-native-ui-lib'

import AddPaymentCardDialog from './AddPaymentCardDialog'
import CreateWalletBtn from './CreateWalletBtn'
import TopUpModal from './TopUpModal'

import { myTheme } from '@/constants'
import { getMyWalletApi } from '@/hooks/api/wallet'
import { PaymentMethod } from '@/types/enum'

interface PaymentSelectionProps {
  register: UseFormRegister<any>
  setValue: UseFormSetValue<any>
  watch: UseFormWatch<any>
  hasPreOrderProduct: boolean
  totalPayment: number
}

export default function PaymentSelection({
  register,
  setValue,
  watch,
  hasPreOrderProduct,
  totalPayment
}: PaymentSelectionProps) {
  const { t } = useTranslation()
  const { data: myWallet } = useQuery({
    queryKey: [getMyWalletApi.queryKey],
    queryFn: getMyWalletApi.fn
  })

  const [topUpModalVisible, setTopUpModalVisible] = useState(false)
  const [paymentCardDialogVisible, setPaymentCardDialogVisible] = useState(false)
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)

  // Get the current payment method value from the form
  const paymentMethod = watch('paymentMethod')

  const isWalletAvailable = myWallet?.data

  const isEnoughBalance = useMemo(() => {
    if (!isWalletAvailable) {
      return false
    }
    const availableBalance = myWallet?.data.availableBalance ?? 0
    return availableBalance >= totalPayment
  }, [myWallet, isWalletAvailable, totalPayment])

  const handleOpenTopUp = useCallback(() => {
    // Present the bottom sheet
    bottomSheetModalRef.current?.present()
    // Set the state after a small delay to ensure the bottom sheet is fully presented
    setTimeout(() => {
      setTopUpModalVisible(true)
    }, 100)
  }, [])

  const handleCloseTopUp = useCallback(() => {
    setTopUpModalVisible(false)
    // Dismiss the bottom sheet after a small delay to ensure state updates
    setTimeout(() => {
      bottomSheetModalRef.current?.dismiss()
    }, 100)
  }, [])

  // Render backdrop component
  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    []
  )

  // Register the payment method field
  React.useEffect(() => {
    register('paymentMethod')
  }, [register])

  const handleSelectPaymentMethod = (value: PaymentMethod) => {
    setValue('paymentMethod', value, { shouldValidate: true })
  }

  const paymentMethods = hasPreOrderProduct
    ? [
        {
          id: PaymentMethod.WALLET,
          label: (
            <View style={styles.labelContainer}>
              <View style={styles.labelTextContainer}>
                <Text style={styles.labelTitle}>{t('wallet.WALLET')}</Text>
                <View style={styles.balanceContainer}>
                  <Text style={styles.balanceLabel}>{t('walletTerm.balance')}:</Text>
                  <Text style={styles.balanceValue} numberOfLines={1} ellipsizeMode='tail'>
                    {t('format.currency', {
                      value: myWallet?.data.availableBalance ?? 0
                    })}
                  </Text>
                </View>
              </View>
            </View>
          ),
          action: (
            <View style={styles.actionContainer}>
              <TouchableOpacity style={styles.topUpButton} onPress={handleOpenTopUp}>
                <Entypo name='wallet' size={16} color={myTheme.white} style={styles.buttonIcon} />
                <Text style={styles.buttonLabel}>{t('walletTerm.topUp')}</Text>
              </TouchableOpacity>
            </View>
          ),
          isDisabled: !isWalletAvailable || !isEnoughBalance,
          icon: <Feather name='credit-card' size={20} color={myTheme.primary} />,
          isAddMore: false
        },
        {
          id: PaymentMethod.BANK_TRANSFER,
          label: `${t('wallet.BANK_TRANSFER')}`,
          icon: <Feather name='maximize' size={20} color={myTheme.primary} />,
          isAddMore: false,
          isDisabled: false
        }
      ]
    : [
        {
          id: PaymentMethod.CASH,
          label: `${t('wallet.CASH')}`,
          icon: <Feather name='dollar-sign' size={20} color={myTheme.primary} />,
          isAddMore: false,
          isDisabled: false
        },
        {
          id: PaymentMethod.WALLET,
          label: (
            <View style={styles.labelContainer}>
              <View style={styles.labelTextContainer}>
                <Text style={styles.labelTitle}>{t('wallet.WALLET')}</Text>
                <View style={styles.balanceContainer}>
                  <Text style={styles.balanceLabel}>{t('walletTerm.balance')}:</Text>
                  <Text style={styles.balanceValue} numberOfLines={1} ellipsizeMode='tail'>
                    {myWallet?.data.availableBalance !== undefined
                      ? t('format.currency', {
                          value: myWallet?.data.availableBalance ?? 0
                        })
                      : '--'}
                  </Text>
                </View>
              </View>
            </View>
          ),
          action: (
            <View style={styles.actionContainer}>
              {isWalletAvailable ? (
                <TouchableOpacity style={styles.topUpButton} onPress={handleOpenTopUp}>
                  <Entypo name='wallet' size={16} color={myTheme.white} style={styles.buttonIcon} />
                  <Text style={styles.buttonLabel}>{t('walletTerm.topUp')}</Text>
                </TouchableOpacity>
              ) : (
                <CreateWalletBtn />
              )}
            </View>
          ),
          isDisabled: !isWalletAvailable || !isEnoughBalance,
          icon: <Feather name='credit-card' size={20} color={myTheme.primary} />,
          isAddMore: false
        },
        {
          id: PaymentMethod.BANK_TRANSFER,
          label: `${t('wallet.BANK_TRANSFER')}`,
          icon: <Feather name='maximize' size={20} color={myTheme.primary} />,
          isAddMore: false,
          isDisabled: false
        }
      ]

  const creditCards = [{ id: '1', name: 'Visa - TienPhong Commercial Joint Stock Bank' }]

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>{t('wallet.choosePaymentMethod')}</Text>
      <View style={styles.formField}>
        <RadioGroup
          initialValue={paymentMethod}
          onValueChange={(value: PaymentMethod) => handleSelectPaymentMethod(value)}
        >
          {paymentMethods.map((method) => (
            <Card key={method.id} style={[styles.methodCard, paymentMethod === method.id && styles.selectedMethodCard]}>
              <View style={styles.methodRow}>
                <RadioButton
                  value={method.id}
                  disabled={method.isDisabled}
                  color={myTheme.primary}
                  style={styles.radioButton}
                  selected={paymentMethod === method.id}
                />
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.methodLabel}
                  disabled={method.isDisabled}
                  onPress={() => handleSelectPaymentMethod(method.id)}
                >
                  <View style={styles.methodLabelContent}>
                    {method.icon}
                    <View style={styles.methodLabelTextContainer}>
                      {typeof method.label === 'string' ? (
                        <Text style={[styles.methodLabelText, method.isDisabled && styles.disabledText]}>
                          {method.label}
                        </Text>
                      ) : (
                        method.label
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
                {method.action}
              </View>

              {method?.isAddMore && !method.isDisabled && (
                <View style={styles.addMoreContainer}>
                  {creditCards?.length > 0 && (
                    <RadioGroup initialValue='visa' onValueChange={(value: string) => {}}>
                      {creditCards?.map((card) => (
                        <View key={card?.id} style={styles.creditCardRow}>
                          <RadioButton value={card.id} color={myTheme.primary} />
                          <Text style={styles.creditCardText} numberOfLines={1} ellipsizeMode='tail'>
                            {card?.name}
                          </Text>
                        </View>
                      ))}
                    </RadioGroup>
                  )}
                  <TouchableOpacity onPress={() => setPaymentCardDialogVisible(true)}>
                    <Text style={styles.addCardText}>{t('wallet.addOtherCard')}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Card>
          ))}
        </RadioGroup>
      </View>

      {/* Bottom Sheet for TopUp Modal */}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={['85%']}
        enablePanDownToClose={false}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handleIndicator}
        onChange={(index) => {
          if (index === -1) {
            setTopUpModalVisible(false)
          }
        }}
        backgroundStyle={styles.bottomSheetBackground}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          {topUpModalVisible && <TopUpModal onClose={handleCloseTopUp} />}
        </BottomSheetView>
      </BottomSheetModal>

      {/* Payment Card Dialog */}
      {paymentCardDialogVisible && <AddPaymentCardDialog textTrigger={t('wallet.addOtherCard')} />}
    </Card>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: myTheme.white,
    borderRadius: 8,
    width: '100%',
    marginVertical: 10
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 16,
    color: myTheme.foreground
  },
  formField: {
    width: '100%'
  },
  methodCard: {
    marginBottom: 8,
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
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%'
  },
  labelTextContainer: {
    flexDirection: 'column'
  },
  labelTitle: {
    fontWeight: '500',
    color: myTheme.foreground
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
    backgroundColor: myTheme.primary,
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
  addMoreContainer: {
    paddingLeft: 40,
    marginTop: 8
  },
  creditCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  creditCardText: {
    marginLeft: 8,
    fontSize: 14,
    color: myTheme.foreground
  },
  addCardText: {
    color: myTheme.primary,
    fontSize: 14
  },
  errorText: {
    color: myTheme.destructive,
    fontSize: 12,
    marginTop: 4
  },
  bottomSheetContent: {
    flex: 1
  },
  bottomSheetBackground: {
    backgroundColor: myTheme.white
  },
  handleIndicator: {
    width: 40,
    height: 4,
    backgroundColor: myTheme.muted,
    alignSelf: 'center'
  }
})
