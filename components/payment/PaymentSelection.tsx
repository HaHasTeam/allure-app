import { Entypo, Feather } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import React, { useMemo } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { RadioButton, RadioGroup, Colors, Card, Dialog, Button } from 'react-native-ui-lib'
import { z } from 'zod'

import AddPaymentCardDialog from './AddPaymentCardDialog'
import CreateWalletBtn from './CreateWalletBtn'
import TopUpModal from './TopUpModal'

import { getMyWalletApi } from '@/hooks/api/wallet'
import { CreateOrderSchema } from '@/schema/order.schema'
import { PaymentMethod } from '@/types/enum'
import { PaymentMethodEnum } from '@/types/payment'

interface PaymentSelectionProps {
  form: UseFormReturn<z.infer<typeof CreateOrderSchema>>
  hasPreOrderProduct: boolean
  totalPayment: number
}

export default function PaymentSelection({ form, hasPreOrderProduct, totalPayment }: PaymentSelectionProps) {
  const { t } = useTranslation()
  const { data: myWallet } = useQuery({
    queryKey: [getMyWalletApi.queryKey],
    queryFn: getMyWalletApi.fn
  })

  const [topUpModalVisible, setTopUpModalVisible] = React.useState(false)
  const [paymentCardDialogVisible, setPaymentCardDialogVisible] = React.useState(false)

  const isWalletAvailable = myWallet?.data

  const isEnoughBalance = useMemo(() => {
    if (!isWalletAvailable) {
      return false
    }
    const availableBalance = myWallet?.data.availableBalance ?? 0
    return availableBalance >= totalPayment
  }, [myWallet, isWalletAvailable, totalPayment])

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
              <Button
                label={t('walletTerm.topUp')}
                backgroundColor={Colors.primary}
                labelStyle={styles.buttonLabel}
                style={styles.button}
                iconSource={() => <Entypo name='wallet' size={16} color={Colors.white} style={styles.buttonIcon} />}
                onPress={() => setTopUpModalVisible(true)}
              />
            </View>
          ),
          isDisabled: !isWalletAvailable || !isEnoughBalance,
          icon: <Entypo name='credit-card' size={20} color={Colors.primary} />,
          isAddMore: false
        },
        {
          id: PaymentMethod.BANK_TRANSFER,
          label: `${t('wallet.BANK_TRANSFER')}`,
          icon: <Feather name='maximize' size={20} color={Colors.primary} />,
          isAddMore: false,
          isDisabled: false
        }
      ]
    : [
        {
          id: PaymentMethod.CASH,
          label: `${t('wallet.CASH')}`,
          icon: <Feather name='dollar-sign' size={20} color={Colors.primary} />,
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
                <Button
                  label={t('walletTerm.topUp')}
                  backgroundColor={Colors.primary}
                  labelStyle={styles.buttonLabel}
                  style={styles.button}
                  iconSource={() => <Entypo name='wallet' size={16} color={Colors.white} style={styles.buttonIcon} />}
                  onPress={() => setTopUpModalVisible(true)}
                />
              ) : (
                <CreateWalletBtn />
              )}
            </View>
          ),
          isDisabled: !isWalletAvailable || !isEnoughBalance,
          icon: <Feather name='credit-card' size={20} color={Colors.primary} />,
          isAddMore: false
        },
        {
          id: PaymentMethod.BANK_TRANSFER,
          label: `${t('wallet.BANK_TRANSFER')}`,
          icon: <Feather name='maximize' size={20} color={Colors.primary} />,
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
          initialValue={form.getValues().paymentMethod}
          onValueChange={(value: PaymentMethodEnum) => form.setValue('paymentMethod', value)}
        >
          {paymentMethods.map((method) => (
            <Card
              key={method.id}
              style={[styles.methodCard, form.getValues().paymentMethod === method.id && styles.selectedMethodCard]}
            >
              <View style={styles.methodRow}>
                <RadioButton
                  value={method.id}
                  disabled={method.isDisabled}
                  color={Colors.primary}
                  style={styles.radioButton}
                />
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.methodLabel}
                  disabled={method.isDisabled}
                  onPress={() => form.setValue('paymentMethod', method.id)}
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
                    <RadioGroup initialValue='visa'>
                      {creditCards?.map((card) => (
                        <View key={card?.id} style={styles.creditCardRow}>
                          <RadioButton value={card.id} color={Colors.primary} />
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
        {form.formState.errors.paymentMethod && (
          <Text style={styles.errorText}>{form.formState.errors.paymentMethod.message}</Text>
        )}
      </View>

      <Dialog
        visible={topUpModalVisible}
        onDismiss={() => setTopUpModalVisible(false)}
        containerStyle={styles.dialogContainer}
      >
        <TopUpModal />
      </Dialog>

      <Dialog
        visible={paymentCardDialogVisible}
        onDismiss={() => setPaymentCardDialogVisible(false)}
        containerStyle={styles.dialogContainer}
      >
        <AddPaymentCardDialog textTrigger='Add Card' />
      </Dialog>
    </Card>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 8,
    width: '100%'
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 16
  },
  formField: {
    width: '100%'
  },
  methodCard: {
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.grey30,
    borderRadius: 8,
    padding: 12
  },
  selectedMethodCard: {
    borderColor: Colors.primary
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
    fontWeight: '500'
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
    fontWeight: '500'
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  balanceLabel: {
    fontSize: 14,
    color: Colors.grey40,
    marginRight: 4
  },
  balanceValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
    maxWidth: 180
  },
  actionContainer: {
    marginLeft: 'auto'
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  buttonLabel: {
    fontSize: 14
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
    fontSize: 14
  },
  addCardText: {
    color: Colors.primary,
    fontSize: 14
  },
  errorText: {
    color: Colors.red30,
    fontSize: 12,
    marginTop: 4
  },
  dialogContainer: {
    maxHeight: '70%',
    width: '90%',
    backgroundColor: Colors.white,
    borderRadius: 8
  }
})
