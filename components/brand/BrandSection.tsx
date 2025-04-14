import { Link } from 'expo-router'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Checkbox } from 'react-native-ui-lib'

import ImageWithFallback from '../image/ImageWithFallBack'

import { myTheme } from '@/constants'
import { hexToRgba } from '@/utils/color'

interface BrandSectionProps {
  brandName: string
  brandId: string
  brandLogo: string
  isBrandSelected?: boolean
  handleBrandSelect?: (value: boolean) => void
}
const BrandSection = ({ brandName, brandId, handleBrandSelect, isBrandSelected, brandLogo }: BrandSectionProps) => {
  return (
    <View>
      <View style={styles.container}>
        {/* group product of brand checkbox */}
        {handleBrandSelect && (
          <Checkbox
            value={isBrandSelected}
            onValueChange={handleBrandSelect}
            style={styles.checkbox}
            color={myTheme.primary}
            size={20}
          />
        )}
        {/* <Ionicons name="storefront-sharp" size={24} style={styles.icon} /> */}
        <Link href='/' style={styles.brandNameLink}>
          <View style={styles.commonFlex}>
            <View style={styles.avatarContainer}>
              <ImageWithFallback source={{ uri: brandLogo }} alt={brandName} resizeMode='cover' style={styles.avatar} />
            </View>
            <Text numberOfLines={2} style={styles.brandName}>
              {brandName}
            </Text>
          </View>
        </Link>
      </View>
    </View>
  )
}

export default BrandSection

const styles = StyleSheet.create({
  brandName: {
    fontWeight: 'semibold',
    color: myTheme.secondaryForeground
  },
  avatarContainer: {
    width: 30,
    height: 30
  },
  avatar: {
    borderRadius: 50,
    width: '100%',
    height: '100%'
  },
  commonFlex: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  icon: {
    color: myTheme.primary
  },
  container: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 6,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    backgroundColor: hexToRgba(myTheme.secondary, 0.3)
  },
  brandNameLink: {
    fontWeight: 'medium'
  },

  checkbox: {
    alignSelf: 'center',
    borderRadius: 6
  }
})
