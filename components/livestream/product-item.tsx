import { Feather } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native'

import { myTheme } from '@/constants/index'
import type { IClassification } from '@/types/classification'
import type { IImage } from '@/types/image'
import type { IResponseProduct } from '@/types/product'

interface ProductItemProps {
  product: {
    id: string
    name: string
    tag: string
    price: number
    currentPrice: number
    images: IImage[]
    deal: number | undefined
    flashSale: {
      productAmount: number
      soldAmount: number
    } | null
    classifications: IClassification[]
    rating: number
    ratingAmount: number
    soldInPastMonth: number
    salesLast30Days: number
  }
  discount?: number
  originalPrice?: number
  discountedPrice?: number
  onAddToCart: (product: IResponseProduct) => void
  onBuyNow: (product: IResponseProduct) => void
}

const ProductItem = ({
  product,
  discount = 0,
  originalPrice,
  discountedPrice,
  onAddToCart,
  onBuyNow
}: ProductItemProps) => {
  const { t } = useTranslation()

  // Get the first image URL or use a placeholder
  const imageUrl =
    product.images && product.images.length > 0 && product.images[0].fileUrl
      ? product.images[0].fileUrl
      : 'https://via.placeholder.com/50'

  // Use provided prices or fall back to product price
  const displayOriginalPrice = originalPrice ?? product.price
  const displayDiscountedPrice = discountedPrice ?? product.currentPrice
  const hasDiscount = (product.deal ?? 0) > 0 || discount > 0 || product.currentPrice < product.price

  // Calculate discount percentage if not provided
  const discountPercentage =
    discount > 0
      ? discount * 100
      : product.deal
        ? product.deal
        : Math.round(((displayOriginalPrice - displayDiscountedPrice) / displayOriginalPrice) * 100)

  // Format numbers for display
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
  }

  return (
    <View style={styles.container}>
      {/* Discount Badge */}
      {hasDiscount && discountPercentage > 0 && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>-{discountPercentage}%</Text>
        </View>
      )}

      <Image source={{ uri: imageUrl }} style={styles.image} resizeMode='cover' />

      <View style={styles.contentContainer}>
        <View style={styles.infoContainer}>
          <View style={styles.titleContainer}>
            <Text style={styles.name} numberOfLines={2} ellipsizeMode='tail'>
              {product.name || 'Product Name'}
            </Text>
          </View>

          {/* Rating and Sales Info */}
          <View style={styles.statsContainer}>
            {product.rating > 0 && (
              <View style={styles.ratingContainer}>
                <Feather name='star' size={10} color='#FFD700' />
                <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
              </View>
            )}
            {product.soldInPastMonth > 0 && (
              <Text style={styles.soldText}>{formatNumber(product.soldInPastMonth)} sold</Text>
            )}
          </View>

          <View style={styles.priceContainer}>
            {hasDiscount ? (
              <>
                <Text style={styles.discountedPrice}>{t('productCard.price', { price: displayDiscountedPrice })}</Text>
                <Text style={styles.originalPrice}>{t('productCard.price', { price: displayOriginalPrice })}</Text>
              </>
            ) : (
              <Text style={styles.price}>{t('productCard.price', { price: displayOriginalPrice })}</Text>
            )}
          </View>
        </View>

        {/* Action Buttons in TikTok Style with Theme Colors */}
        <View style={styles.actionsContainer}>
          <View style={[styles.buttonGroup, { backgroundColor: myTheme.primary }]}>
            <TouchableOpacity
              style={[styles.cartButton, { backgroundColor: myTheme.accent }]}
              onPress={() => onAddToCart(product as any)}
            >
              <Feather name='shopping-bag' size={14} color={myTheme.primaryForeground} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.buyButton} onPress={() => onBuyNow(product as any)}>
              <Text style={[styles.buyButtonText, { color: myTheme.primaryForeground }]}>Buy Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    height: 120, // Fixed height for the card
    position: 'relative' // For absolute positioning of discount badge
  },
  discountBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#f96c9c', // Using theme primary color for discount badge
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderTopLeftRadius: 12,
    borderBottomRightRadius: 12,
    zIndex: 1
  },
  discountText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff'
  },
  image: {
    width: 96,
    height: 96, // Match the content height
    borderRadius: 8,
    backgroundColor: '#f3f4f6'
  },
  contentContainer: {
    flex: 1,
    marginLeft: 12,
    flexDirection: 'column', // Changed to column to stack info and actions
    justifyContent: 'space-between',
    height: '100%'
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between'
  },
  titleContainer: {
    height: 36, // Fixed height for title (2 lines)
    overflow: 'hidden'
  },
  name: {
    fontSize: 12, // Smaller font size like TikTok
    fontWeight: '500', // Slightly lighter weight
    color: '#1f2937',
    lineHeight: 18 // Adjusted line height
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6
  },
  ratingText: {
    fontSize: 10, // Smaller font size like TikTok
    color: '#6b7280',
    marginLeft: 2
  },
  soldText: {
    fontSize: 10, // Smaller font size like TikTok
    color: '#6b7280'
  },
  priceContainer: {
    flexDirection: 'column'
  },
  price: {
    fontSize: 14, // Slightly smaller
    fontWeight: '700', // Bolder
    color: '#4b5563'
  },
  discountedPrice: {
    fontSize: 15, // Slightly larger for emphasis
    fontWeight: '700',
    color: '#f96c9c' // Using theme primary color for discounted price
  },
  originalPrice: {
    fontSize: 10, // Smaller font size like TikTok
    color: '#94a3b8',
    textDecorationLine: 'line-through',
    marginTop: 1
  },
  actionsContainer: {
    width: '100%',
    alignItems: 'flex-end',
    marginTop: 2
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 2,
    overflow: 'hidden'
  },
  cartButton: {
    width: 32,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buyButton: {
    paddingHorizontal: 8,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buyButtonText: {
    fontWeight: '600',
    fontSize: 11
  }
})

export default ProductItem
