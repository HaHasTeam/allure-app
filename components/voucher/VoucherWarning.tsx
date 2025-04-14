import { Feather } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'

import { myTheme } from '@/constants'
import { VoucherUnavailableReasonEnum } from '@/types/enum'

interface WarningProps {
  reason?: VoucherUnavailableReasonEnum
  minOrderValue?: number
}

const VoucherWarning: React.FC<WarningProps> = ({ reason, minOrderValue }) => {
  const { t } = useTranslation()
  const warningMessages: Record<VoucherUnavailableReasonEnum, string> = {
    [VoucherUnavailableReasonEnum.MINIMUM_ORDER_NOT_MET]: t('voucher.reason.minOrder', { amount: minOrderValue }),
    [VoucherUnavailableReasonEnum.OUT_OF_STOCK]: t('voucher.reason.soldOut'),
    [VoucherUnavailableReasonEnum.NOT_START_YET]: t('voucher.reason.notStart'),
    [VoucherUnavailableReasonEnum.NOT_APPLICABLE]: t('voucher.reason.notApplicable')
  }
  const message = reason && warningMessages[reason]

  if (!message) return null

  return (
    <View style={styles.container}>
      <Feather name='alert-circle' size={20} color={myTheme.red[500]} />
      <Text style={styles.text}>{message}</Text>
    </View>
  )
}

export default VoucherWarning
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FEE2E2',
    padding: 6,
    borderRadius: 8
  },
  text: {
    fontSize: 12,
    color: '#EF4444'
  }
})
