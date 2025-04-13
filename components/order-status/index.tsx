import { useTranslation } from 'react-i18next'
import { View, Text, StyleSheet } from 'react-native'

import { myTheme } from '@/constants'
import { ShippingStatusEnum } from '@/types/enum'

interface OrderStatusProps {
  tag: string
  text?: string
  size?: 'small' | 'medium' | 'large'
}

export default function OrderStatus({ tag, text, size = 'small' }: OrderStatusProps) {
  const { t } = useTranslation()

  const styles = StyleSheet.create({
    container: {
      padding: 6, // p-2 equivalent
      borderRadius: 9999, // rounded-full
      alignSelf: 'baseline'
    },
    text: {
      textTransform: 'uppercase',
      fontWeight: 'bold'
    },
    textSmall: {
      fontSize: 10
    },
    textMedium: {
      fontSize: 12
    },
    textLarge: {
      fontSize: 16
    },
    sizeSmall: {
      paddingHorizontal: 8, // px-1
      paddingVertical: 3,
      fontSize: 10 // text-xs
    },
    sizeMedium: {
      paddingHorizontal: 8, // px-2
      paddingVertical: 4, // py-1
      fontSize: 12 // text-sm (base)
    },
    sizeMediumSm: {
      fontSize: 12 // sm:text-xs
    },
    sizeLarge: {
      padding: 12, // p-3
      fontSize: 16 // lg:text-base
    },
    sizeLargeMd: {
      fontSize: 14 // md:text-sm
    },
    sizeLargeSm: {
      fontSize: 12 // sm:text-xs
    }
  })

  let tagColor = {}
  let bgColor = {}
  let tagText = ''

  // Define color based on tag using myTheme
  switch (tag) {
    case ShippingStatusEnum.JOIN_GROUP_BUYING:
      tagColor = { color: myTheme.teal[400] }
      bgColor = { backgroundColor: myTheme.teal[100] }
      tagText = t('order.joinGroupBuying')
      break
    case ShippingStatusEnum.TO_PAY:
      tagColor = { color: myTheme.yellow[500] }
      bgColor = { backgroundColor: myTheme.yellow[100] }
      tagText = t('order.pending')
      break
    case ShippingStatusEnum.WAIT_FOR_CONFIRMATION:
      tagColor = { color: myTheme.lime[600] }
      bgColor = { backgroundColor: myTheme.lime[100] }
      tagText = t('order.waitConfirm')
      break
    case ShippingStatusEnum.TO_SHIP:
      tagColor = { color: myTheme.orange[600] }
      bgColor = { backgroundColor: myTheme.orange[100] }
      tagText = t('order.shipping')
      break
    case ShippingStatusEnum.PREPARING_ORDER:
      tagColor = { color: myTheme.purple[600] }
      bgColor = { backgroundColor: myTheme.purple[100] }
      tagText = t('order.preparingOrder')
      break
    case ShippingStatusEnum.SHIPPING:
      tagColor = { color: myTheme.cyan[600] }
      bgColor = { backgroundColor: myTheme.cyan[100] }
      tagText = t('order.delivering')
      break
    case ShippingStatusEnum.DELIVERED:
      tagColor = { color: myTheme.blue[600] }
      bgColor = { backgroundColor: myTheme.blue[100] }
      tagText = t('order.delivered')
      break
    case ShippingStatusEnum.COMPLETED:
      tagColor = { color: myTheme.green[600] }
      bgColor = { backgroundColor: myTheme.green[100] }
      tagText = t('order.completed')
      break
    case ShippingStatusEnum.PENDING_CANCELLATION:
      tagColor = { color: myTheme.amber[600] }
      bgColor = { backgroundColor: myTheme.amber[100] }
      tagText = t('order.pendingCancellation')
      break
    case ShippingStatusEnum.PENDING_RETURN_APPROVED:
      tagColor = { color: myTheme.slate[600] }
      bgColor = { backgroundColor: myTheme.slate[100] }
      tagText = t('order.pendingReturnApproved')
      break
    case ShippingStatusEnum.CANCELLED:
      tagColor = { color: myTheme.red[600] }
      bgColor = { backgroundColor: myTheme.red[100] }
      tagText = t('order.cancelled')
      break
    case ShippingStatusEnum.RETURNING:
      tagColor = { color: myTheme.indigo[600] }
      bgColor = { backgroundColor: myTheme.indigo[100] }
      tagText = t('order.returning')
      break
    case ShippingStatusEnum.BRAND_RECEIVED:
      tagColor = { color: myTheme.emerald[600] }
      bgColor = { backgroundColor: myTheme.emerald[100] }
      tagText = t('order.brandReceived')
      break
    case ShippingStatusEnum.RETURNED_FAIL:
      tagColor = { color: myTheme.rose[600] }
      bgColor = { backgroundColor: myTheme.rose[300] }
      tagText = t('order.returnedFail')
      break
    case ShippingStatusEnum.REFUNDED:
      tagColor = { color: myTheme.gray[600] }
      bgColor = { backgroundColor: myTheme.gray[100] }
      tagText = t('order.refunded')
      break
    default:
      tagColor = { color: myTheme.gray[800] }
      bgColor = { backgroundColor: myTheme.gray[100] }
      tagText = tag
      break
  }

  const sizeStyle =
    size === 'small'
      ? styles.sizeSmall
      : size === 'large'
        ? [styles.sizeLarge, styles.sizeLargeMd, styles.sizeLargeSm]
        : [styles.sizeMedium, styles.sizeMediumSm]
  const textSize = size === 'small' ? styles.textSmall : size === 'large' ? styles.textLarge : styles.textMedium

  return (
    <View style={[styles.container, bgColor, sizeStyle]}>
      <Text style={[styles.text, textSize, tagColor]}>{text ? text : tagText}</Text>
    </View>
  )
}
