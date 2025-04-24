import { Feather } from '@expo/vector-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as Linking from 'expo-linking'
import React, { useEffect, useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { View, Text, StyleSheet, ScrollView, TextInput, Image } from 'react-native'
import { Button, RadioButton, RadioGroup, Badge } from 'react-native-ui-lib'
import WebView from 'react-native-webview'
import { z } from 'zod'

import SuccessContent from './SuccessContent'

import { myTheme } from '@/constants'
import { generatePaymentLinkApi } from '@/hooks/api/payment'
import { filterTransactions } from '@/hooks/api/transaction'
import { depositToWallet, getMyWalletApi } from '@/hooks/api/wallet'
import { PaymentMethodEnum } from '@/types/payment'

const formSchema = z.object({
  amount: z.coerce.number(),
  method: z.string()
})

type FormValues = z.infer<typeof formSchema>

interface TopUpModalProps {
  onClose?: () => void
}

export default function TopUpModal({ onClose }: TopUpModalProps) {
  const { t } = useTranslation()
  const [webViewVisible, setWebViewVisible] = useState(false)
  const scrollViewRef = useRef<ScrollView>(null)
  const url = Linking.createURL('/(app)/(checkout)/result')
  const { mutateAsync: generatePaymentLink, data: paymentLinkRes } = useMutation({
    mutationKey: [generatePaymentLinkApi.mutationKey],
    mutationFn: generatePaymentLinkApi.fn
  })

  const { mutateAsync: depositToWalletFn, data: depositRes } = useMutation({
    mutationKey: [depositToWallet.mutationKey],
    mutationFn: depositToWallet.fn
  })

  const [paidId, setPaidId] = useState<string>()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (paidId) {
      depositToWalletFn({ orderId: paidId }).then(() => {
        queryClient.invalidateQueries({
          queryKey: [getMyWalletApi.queryKey]
        })
        queryClient.invalidateQueries({
          queryKey: [filterTransactions.queryKey]
        })
      })
    }
  }, [paidId, depositToWalletFn, queryClient])

  useEffect(() => {
    if (paymentLinkRes?.data.url) {
      setWebViewVisible(true)
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true })
      }, 300)
    }
  }, [paymentLinkRes?.data.url])

  const predefinedAmounts = [
    {
      value: 100000,
      label: t('format.currency', {
        value: 100000
      })
    },
    {
      value: 200000,
      label: t('format.currency', {
        value: 200000
      })
    },
    {
      value: 500000,
      label: t('format.currency', {
        value: 500000
      })
    },
    {
      value: 1000000,
      label: t('format.currency', {
        value: 1000000
      })
    }
  ]

  const { control, handleSubmit, setValue, watch, formState } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      method: PaymentMethodEnum.BANK_TRANSFER
    }
  })

  const amount = watch('amount')
  const method = watch('method')
  const readOnlyForm = !!paymentLinkRes?.data.url

  const onSubmit = async (data: FormValues) => {
    if (data.method === PaymentMethodEnum.BANK_TRANSFER) {
      await generatePaymentLink({
        amount: data.amount,
        description: 'TOP UP ACTION'
      })
    }
  }

  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data)
      if (data.id) {
        setPaidId(data.id)
        setWebViewVisible(false)
      }
    } catch (error) {
      console.error('Failed to parse WebView message:', error)
    }
  }

  const handleClose = () => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <ScrollView ref={scrollViewRef} style={styles.container} contentContainerStyle={styles.contentContainer}>
      {!depositRes && (
        <>
          <View style={styles.amountContainer}>
            <View style={styles.amountHeader}>
              <View style={styles.amountLabelContainer}>
                <Text style={styles.amountLabel}>{t('wallet.amount', 'Amount')}</Text>
                <Badge label={t('wallet.topUp', 'Top Up')} backgroundColor={myTheme.primary} />
              </View>
              <View style={styles.currencyContainer}>
                <Text style={styles.currencyCode}>VND</Text>
                <Text style={styles.currencySeparator}>|</Text>
                <Text style={styles.currencyName}>{t('currency.vnd', 'Viet Nam Dong')}</Text>
              </View>
            </View>

            <Controller
              control={control}
              name='amount'
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={styles.amountInput}
                  value={value === 0 ? '' : value.toString()}
                  onChangeText={(text) => onChange(text ? parseInt(text, 10) : 0)}
                  keyboardType='numeric'
                  placeholder='0'
                  placeholderTextColor={myTheme.mutedForeground}
                  editable={!readOnlyForm}
                />
              )}
            />

            <View style={styles.predefinedAmountsContainer}>
              {predefinedAmounts.map((amt) => (
                <Button
                  key={amt.value.toString()}
                  label={amt.label}
                  backgroundColor={amount === amt.value ? myTheme.primary : myTheme.white}
                  outlineColor={myTheme.border}
                  outline={amount !== amt.value}
                  style={styles.amountButton}
                  labelStyle={[styles.amountButtonLabel, amount === amt.value && styles.amountButtonLabelSelected]}
                  onPress={() => {
                    if (!readOnlyForm) {
                      setValue('amount', amt.value)
                    }
                  }}
                  disabled={readOnlyForm}
                />
              ))}
            </View>
          </View>

          <Controller
            control={control}
            name='method'
            render={({ field: { onChange, value } }) => (
              <View style={styles.methodsContainer}>
                <RadioGroup
                  initialValue={value}
                  onValueChange={(val: PaymentMethodEnum) => {
                    if (!readOnlyForm) {
                      onChange(val)
                    }
                  }}
                >
                  <View style={styles.methodItem}>
                    <View style={styles.methodItemLeft}>
                      <RadioButton
                        value={PaymentMethodEnum.BANK_TRANSFER}
                        selected={value === PaymentMethodEnum.BANK_TRANSFER}
                        color={myTheme.primary}
                        disabled={readOnlyForm}
                      />
                      <View style={styles.methodLabelContainer}>
                        <View style={styles.methodLabelRow}>
                          <Text style={styles.methodLabel}>{t('wallet.payByBank', 'Pay by bank')}</Text>
                          <View style={styles.bankLogosContainer}>
                            <Image
                              source={{
                                uri: 'https://cdn.haitrieu.com/wp-content/uploads/2022/02/Logo-Vietcombank.png'
                              }}
                              style={styles.bankLogo}
                            />
                            <Image
                              source={{ uri: 'https://cdn.haitrieu.com/wp-content/uploads/2021/11/Logo-TCB-V.png' }}
                              style={styles.bankLogo}
                            />
                            <Image
                              source={{ uri: 'https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-BIDV-.png' }}
                              style={styles.bankLogo}
                            />
                            <Image
                              source={{
                                uri: 'https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-MoMo-Square.png'
                              }}
                              style={styles.bankLogo}
                            />
                          </View>
                        </View>

                        {value === PaymentMethodEnum.BANK_TRANSFER && (
                          <View style={styles.paymentProviderContainer}>
                            <Image
                              source={{ uri: 'https://payos.vn/wp-content/uploads/sites/13/2023/07/payos-logo.svg' }}
                              style={styles.paymentProviderLogo}
                              resizeMode='contain'
                            />
                            <Text style={styles.paymentProviderText}>
                              {t(
                                'wallet.paymentProviderInfo',
                                'We collaborate with PayOS to provide you with the best payment experience with free fee.'
                              )}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <Feather name='chevron-right' size={16} color={myTheme.mutedForeground} />
                  </View>
                </RadioGroup>
              </View>
            )}
          />
        </>
      )}

      {webViewVisible && paymentLinkRes?.data.url && (
        <View style={styles.webViewContainer}>
          <WebView
            source={{ uri: paymentLinkRes.data.url }}
            style={styles.webView}
            onMessage={handleWebViewMessage}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            injectedJavaScript={`
              window.addEventListener('message', function(e) {
                window.ReactNativeWebView.postMessage(e.data);
              });
              true;
            `}
          />
        </View>
      )}

      {!depositRes && !webViewVisible && (
        <View style={styles.buttonContainer}>
          <Button
            label={t('common.continue', 'Continue')}
            style={styles.continueButton}
            backgroundColor={myTheme.secondary}
            labelStyle={styles.continueButtonLabel}
            onPress={handleSubmit(onSubmit)}
            disabled={formState.isSubmitting}
            loading={formState.isSubmitting}
          />
          <Button
            label={t('button.cancel', 'Cancel')}
            style={styles.cancelButton}
            backgroundColor={myTheme.white}
            outlineColor={myTheme.border}
            labelStyle={styles.cancelButtonLabel}
            outline
            onPress={handleClose}
          />
        </View>
      )}

      {!!depositRes && (
        <View style={styles.successContainer}>
          <SuccessContent />
          <Button
            label={t('wallet.close', 'Close')}
            style={styles.closeButton}
            backgroundColor={myTheme.secondary}
            labelStyle={styles.closeButtonLabel}
            onPress={handleClose}
          />
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: myTheme.white
  },
  contentContainer: {
    padding: 16
  },
  amountContainer: {
    backgroundColor: myTheme.lightGrey || myTheme.background,
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: myTheme.border,
    marginBottom: 24
  },
  amountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  amountLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  amountLabel: {
    fontSize: 14,
    color: myTheme.mutedForeground,
    marginRight: 8
  },
  currencyContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  currencyCode: {
    fontSize: 18,
    fontWeight: '600',
    color: myTheme.foreground
  },
  currencySeparator: {
    marginHorizontal: 4,
    color: myTheme.mutedForeground
  },
  currencyName: {
    fontSize: 14,
    color: myTheme.mutedForeground,
    fontWeight: '300'
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '400',
    marginBottom: 16,
    padding: 0,
    color: myTheme.foreground
  },
  predefinedAmountsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4
  },
  amountButton: {
    margin: 4,
    borderRadius: 20,
    minWidth: 80
  },
  amountButtonLabel: {
    color: myTheme.foreground
  },
  amountButtonLabelSelected: {
    color: myTheme.white
  },
  methodsContainer: {
    marginBottom: 24
  },
  methodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: myTheme.border
  },
  methodItemLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  methodLabelContainer: {
    marginLeft: 12
  },
  methodLabelRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  methodLabel: {
    fontSize: 16,
    marginRight: 8,
    color: myTheme.foreground
  },
  bankLogosContainer: {
    flexDirection: 'row'
  },
  bankLogo: {
    width: 16,
    height: 16,
    marginHorizontal: 2
  },
  paymentProviderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12
  },
  paymentProviderLogo: {
    width: 80,
    height: 24,
    marginRight: 8
  },
  paymentProviderText: {
    flex: 1,
    fontSize: 14,
    color: myTheme.mutedForeground,
    fontWeight: '300'
  },
  webViewContainer: {
    height: 500,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: myTheme.border,
    borderRadius: 8,
    overflow: 'hidden'
  },
  webView: {
    flex: 1
  },
  buttonContainer: {
    marginTop: 16
  },
  continueButton: {
    marginBottom: 8,
    backgroundColor: myTheme.primary
  },
  continueButtonLabel: {
    color: myTheme.white,
    fontWeight: '500'
  },
  cancelButton: {
    marginTop: 8
  },
  cancelButtonLabel: {
    color: myTheme.foreground
  },
  successContainer: {
    alignItems: 'center'
  },
  closeButton: {
    marginTop: 16,
    width: '100%',
    backgroundColor: myTheme.primary
  },
  closeButtonLabel: {
    color: myTheme.white,
    fontWeight: '500'
  }
})
