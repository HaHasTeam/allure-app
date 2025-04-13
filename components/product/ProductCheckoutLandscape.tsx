'use client'

import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import ProductTag from './ProductTag'
import ImageWithFallback from '../image/ImageWithFallBack'

import { myTheme } from '@/constants'
import type { IClassification } from '@/types/classification'
import { ClassificationTypeEnum, DiscountTypeEnum } from '@/types/enum'
import type { DiscountType } from '@/types/product-discount'
import { calculateDiscountPrice } from '@/utils/price'

interface ProductCheckoutLandscapeProps {
  productImage: string
  productId: string
  productName: string
  selectedClassification: string
  eventType: string
  discountType?: DiscountType | null
  discount?: number | null
  price: number
  productQuantity: number
  productClassification: IClassification | null
  livestreamDiscount?: number
}

const ProductCheckoutLandscape = ({
  productImage,
  productId,
  productName,
  discountType,
  discount,
  eventType,
  productQuantity,
  selectedClassification,
  price,
  productClassification,
  livestreamDiscount
}: ProductCheckoutLandscapeProps) => {
  const { t } = useTranslation()
  const router = useRouter()

  // Check if livestream discount exists and calculate it
  const hasLivestreamDiscount = livestreamDiscount !== undefined && livestreamDiscount > 0

  // Calculate prices based on discounts
  let finalPrice = price
  let originalPrice = price

  // Apply regular discount if it exists
  if (
    discount &&
    discount > 0 &&
    (discountType === DiscountTypeEnum.AMOUNT || discountType === DiscountTypeEnum.PERCENTAGE)
  ) {
    finalPrice = calculateDiscountPrice(price, discount, discountType)
  }

  // Apply livestream discount if it exists (on top of any existing discount)
  if (hasLivestreamDiscount) {
    originalPrice = finalPrice
    const mockDiscount = DiscountTypeEnum.PERCENTAGE
    finalPrice = calculateDiscountPrice(finalPrice, livestreamDiscount, mockDiscount)

    // finalPrice =  finalPrice - (finalPrice * livestreamDiscount) / 100;
  }

  // Calculate total price with quantity
  const totalPrice = finalPrice * productQuantity

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => router.push(`/(products)/product-detail/${productId}`)}>
          <View style={styles.imageContainer}>
            <ImageWithFallback
              source={{ uri: productImage || '/placeholder.svg' }}
              alt={productName}
              style={styles.image}
              resizeMode='cover'
            />
          </View>
        </TouchableOpacity>

        <View style={styles.detailsContainer}>
          <View style={styles.productInfo}>
            <TouchableOpacity onPress={() => router.push(`/products/${productId}`)}>
              <Text numberOfLines={2} ellipsizeMode='tail' style={styles.overFlowText}>
                {productName}
              </Text>
            </TouchableOpacity>
            <View style={styles.tagContainer}>
              {eventType ? <ProductTag tag={eventType} size='small' /> : null}
              {hasLivestreamDiscount && <ProductTag tag='LIVESTREAM' size='small' />}
            </View>
          </View>
          {productClassification?.type === ClassificationTypeEnum.CUSTOM && (
            <View style={styles.classificationContainer}>
              <Text style={styles.classificationLabel}>{t('productDetail.classification')}:</Text>
              <Text style={styles.classificationValue} numberOfLines={3}>
                {selectedClassification}
              </Text>
            </View>
          )}

          {discount || hasLivestreamDiscount ? (
            <View style={styles.priceContainer}>
              <Text style={styles.discountPrice}>{t('productCard.currentPrice', { price: finalPrice })}</Text>
              <Text style={styles.originalPrice}>{t('productCard.price', { price: originalPrice })}</Text>
              {hasLivestreamDiscount && <Text style={styles.discountBadge}>-{livestreamDiscount * 100}%</Text>}
            </View>
          ) : (
            <View style={styles.priceContainer}>
              <Text style={styles.regularPrice}>{t('productCard.price', { price })}</Text>
            </View>
          )}
        </View>

        <View style={styles.lastItem}>
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityText}>x{productQuantity}</Text>
          </View>
          <Text style={styles.totalPrice}>{t('productCard.currentPrice', { price: totalPrice })}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  overFlowText: {
    flexShrink: 1,
    flexWrap: 'wrap',
    maxWidth: '100%'
  },
  lastItem: {
    alignItems: 'flex-end'
  },
  container: {
    width: '100%',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: myTheme.gray[200],
    flexDirection: 'row'
  },
  row: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    width: '100%'
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 6
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 6
  },
  detailsContainer: {
    flex: 1,
    flexDirection: 'column',
    gap: 6
  },
  productInfo: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4
  },
  tagContainer: {
    flexDirection: 'row',
    gap: 4
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    flexWrap: 'wrap',
    width: '100%'
  },
  classificationContainer: {
    flexDirection: 'column',
    gap: 6
  },
  classificationLabel: {
    fontSize: 12,
    color: myTheme.mutedForeground
  },
  classificationValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: myTheme.primary,
    width: '100%'
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  discountPrice: {
    fontSize: 14,
    color: myTheme.red[500],
    fontWeight: 'bold'
  },
  originalPrice: {
    fontSize: 14,
    color: myTheme.gray[400],
    textDecorationLine: 'line-through'
  },
  regularPrice: {
    fontSize: 14
  },
  quantityContainer: {
    alignItems: 'center'
  },
  quantityText: {
    fontSize: 14
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: myTheme.red[500],
    textAlign: 'center'
  },
  discountBadge: {
    fontSize: 12,
    color: myTheme.white,
    backgroundColor: myTheme.red[500],
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4
  }
})

export default ProductCheckoutLandscape
