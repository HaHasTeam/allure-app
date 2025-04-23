import { Feather } from '@expo/vector-icons'
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps // Import the props type
} from '@gorhom/bottom-sheet'
import React, { useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View, Image, TextInput } from 'react-native'
import { Button, Colors, TouchableOpacity } from 'react-native-ui-lib'

import CVVHelpPopover from './CVVHelpPopover'

// Import your image properly for React Native
const paymentCardsImage = require('@/assets/images/paymentCard1.jpg')

interface AddPaymentCardDialogProps {
  textTrigger: string
}

export default function AddPaymentCardDialog({ textTrigger }: AddPaymentCardDialogProps) {
  const { t } = useTranslation()
  // Create a ref for the bottom sheet modal
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)

  // Callbacks for opening and closing the bottom sheet
  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present()
  }, [])

  const handleDismissModalPress = useCallback(() => {
    bottomSheetModalRef.current?.dismiss()
  }, [])

  // Render backdrop component with proper type annotation
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    []
  )

  return (
    <>
      <TouchableOpacity style={styles.triggerButton} onPress={handlePresentModalPress}>
        <Feather name='plus' size={16} color={Colors.primary} />
        <Text style={styles.triggerText}>{textTrigger}</Text>
      </TouchableOpacity>

      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={['75%']}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.indicator}
      >
        <BottomSheetView style={styles.contentContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('wallet.addCard')}</Text>
          </View>

          <View style={styles.content}>
            <View style={styles.cardLogosContainer}>
              <Image source={paymentCardsImage} style={styles.cardLogos} resizeMode='contain' />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('wallet.cardNumber')}:</Text>
              <TextInput
                style={styles.input}
                placeholder={t('wallet.cardNumberEx')}
                placeholderTextColor={Colors.grey40}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('wallet.bankAccount')}:</Text>
              <TextInput
                style={styles.input}
                placeholder={t('wallet.bankAccountEx')}
                placeholderTextColor={Colors.grey40}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>{t('date.expiredDate')}:</Text>
                <TextInput style={styles.input} placeholder='MM/YY' placeholderTextColor={Colors.grey40} />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <View style={styles.cvvLabelContainer}>
                  <Text style={styles.label}>{t('wallet.cvv')}:</Text>
                  <CVVHelpPopover />
                </View>
                <TextInput style={styles.input} placeholder={t('wallet.cvvEx')} placeholderTextColor={Colors.grey40} />
              </View>
            </View>

            <View style={styles.securityBox}>
              <View style={styles.securityHeader}>
                <Feather name='shield' size={20} color='#15803d' />
                <Text style={styles.securityTitle}>{t('wallet.securityChecked')}</Text>
              </View>
              <Text style={styles.securityText}>{t('wallet.saveCard')}</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Button
              label={t('button.cancel')}
              outline
              outlineColor={Colors.grey50}
              style={styles.cancelButton}
              onPress={handleDismissModalPress}
            />
            <Button
              label={t('button.submit')}
              backgroundColor={Colors.primary}
              style={styles.submitButton}
              onPress={handleDismissModalPress}
            />
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  )
}

const styles = StyleSheet.create({
  triggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8
  },
  triggerText: {
    color: Colors.primary,
    marginLeft: 4,
    fontSize: 14
  },
  contentContainer: {
    flex: 1,
    backgroundColor: Colors.white
  },
  indicator: {
    width: 40,
    height: 4,
    backgroundColor: Colors.grey40
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey30
  },
  title: {
    fontSize: 18,
    fontWeight: '600'
  },
  content: {
    padding: 16
  },
  cardLogosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  cardLogos: {
    width: 100,
    height: 30
  },
  inputGroup: {
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.grey30,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  halfWidth: {
    width: '48%'
  },
  cvvLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  securityBox: {
    backgroundColor: Colors.grey10,
    borderRadius: 8,
    padding: 16,
    marginTop: 8
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  securityTitle: {
    fontWeight: '600',
    marginLeft: 4
  },
  securityText: {
    fontSize: 14,
    color: Colors.grey40,
    paddingLeft: 24
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.grey30
  },
  cancelButton: {
    marginRight: 8
  },
  submitButton: {
    minWidth: 80
  }
})
