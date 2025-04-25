import { useTranslation } from 'react-i18next'
import { StyleSheet, View, Text } from 'react-native'

import { myTheme } from '@/constants'

interface OrderSummaryProps {
  totalProductCost: number
  totalBrandDiscount: number
  totalPlatformDiscount: number
  totalPayment: number
  paymentMethod: string
}

export default function OrderSummary({
  totalProductCost,
  totalBrandDiscount,
  totalPlatformDiscount,
  totalPayment,
  paymentMethod
}: OrderSummaryProps) {
  const { t } = useTranslation()

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.spaceY3}>
          {/* Total Cost */}
          <View style={styles.row}>
            <Text style={styles.label}>{t('cart.totalCost')}</Text>
            <Text style={styles.value}>{t('productCard.price', { price: totalProductCost })}</Text>
          </View>

          {/* Brand Discount */}
          <View style={styles.row}>
            <Text style={styles.label}>{t('cart.discountBrand')}</Text>
            <Text style={[styles.value, { color: myTheme.green[700] }]}>
              {totalBrandDiscount && totalBrandDiscount > 0 ? '-' : ''}
              {t('productCard.price', { price: totalBrandDiscount })}
            </Text>
          </View>

          {/* Platform Discount */}
          <View style={styles.row}>
            <Text style={styles.label}>{t('cart.discountPlatform')}</Text>
            <Text style={[styles.value, { color: myTheme.green[700] }]}>
              {totalPlatformDiscount && totalPlatformDiscount > 0 ? '-' : ''}
              {t('productCard.price', { price: totalPlatformDiscount })}
            </Text>
          </View>

          {/* Total Payment */}
          <View style={styles.totalSection}>
            <View style={[styles.row, styles.borderTop]}>
              <Text style={styles.totalLabel}>{t('cart.totalPayment')}</Text>
              <Text style={[styles.totalValue, { color: myTheme.red[500] }]}>
                {t('productCard.price', { price: totalPayment })}
              </Text>
            </View>
            <View style={styles.checkoutDescription}>
              <Text style={[styles.label, styles.textRight]}>{t('cart.checkoutDescription')}</Text>
            </View>
          </View>

          {/* Payment Method */}
          <View style={[styles.row, styles.borderTop]}>
            <Text style={styles.totalLabel}>{t('wallet.paymentMethod')}</Text>
            <Text style={[styles.totalValue, { color: myTheme.primary }]}>{paymentMethod}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: myTheme.white,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2 // For Android shadow
  },
  content: {
    flexDirection: 'column'
  },
  spaceY3: {
    flexDirection: 'column',
    gap: 12 // React Native uses gap for spacing
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  label: {
    fontSize: 14,
    color: myTheme.mutedForeground // Assuming mutedForeground is defined in myTheme
  },
  value: {
    fontSize: 14,
    fontWeight: '500'
  },
  totalSection: {
    flexDirection: 'column'
  },
  borderTop: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: myTheme.gray[200] // Assuming a light gray for divider
  },
  totalLabel: {
    fontSize: 16
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '600'
  },
  checkoutDescription: {
    marginVertical: 12
  },
  textRight: {
    textAlign: 'right'
  }
})
