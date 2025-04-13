import { useTranslation } from 'react-i18next'
import { View, Text, StyleSheet } from 'react-native'

import { myTheme } from '@/constants'
import { hexToRgba } from '@/utils/color'

export default function CheckoutHeader() {
  const { t } = useTranslation()

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.productSection}>
          <Text style={styles.label}>{t('cart.Products')}</Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.emptySection} />
          <View style={styles.middleSection} />
          <View style={styles.priceSection}>
            <Text style={styles.priceText}>{t('cart.price')}</Text>
          </View>
        </View>

        <View style={styles.quantitySection}>
          <Text style={styles.sectionText}>{t('cart.quantity')}</Text>
        </View>

        <View style={styles.totalSection}>
          <Text style={styles.sectionText}>{t('cart.total')}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: hexToRgba(myTheme.secondary, 0.3),
    borderRadius: 4,
    color: myTheme.primary
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 8
  },
  productSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  label: {
    color: myTheme.primary,
    fontWeight: '500'
  },
  infoSection: {
    flexDirection: 'row',
    width: '54%'
  },
  emptySection: {
    width: '100%' // base width
  },
  middleSection: {
    width: '100%'
  },
  priceSection: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  priceText: {
    color: myTheme.primary,
    fontWeight: '500'
  },
  quantitySection: {
    width: '10%', // base width
    alignItems: 'center'
  },
  totalSection: {
    width: '20%', // base width
    alignItems: 'center'
  },
  sectionText: {
    color: myTheme.primary,
    fontWeight: '500',
    fontSize: 12 // base text-xs
  }
})
