import { Feather } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'expo-router'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native'

import Empty from '../empty'
import ProductCard from '../product/ProductCard'

import { myTheme } from '@/constants'
import { getProductFilterApi } from '@/hooks/api/product'
import { DiscountTypeEnum, OrderEnum, ProductEnum, StatusEnum } from '@/types/enum'
import { IResponseProduct } from '@/types/product'
import { calculateDiscountPrice } from '@/utils/price'
import { getCheapestClassification } from '@/utils/product'

const RecommendProduct = () => {
  const { t } = useTranslation()

  const { data: products, isLoading } = useQuery({
    queryKey: [
      getProductFilterApi.queryKey,
      {
        page: 1,
        limit: 10
      }
    ],
    queryFn: getProductFilterApi.fn
  })

  const renderProductCard = ({ item: product }: { item: IResponseProduct }) => {
    const productClassifications = product?.productClassifications?.filter(
      (classification) => classification.status === StatusEnum.ACTIVE
    )
    const productClassification = getCheapestClassification(product.productClassifications ?? [])
    const isActive = productClassification?.status === StatusEnum.ACTIVE
    const hasDiscount = isActive && productClassification?.productDiscount
    const hasPreOrder = isActive && productClassification?.preOrderProduct

    const currentPrice = calculateDiscountPrice(
      productClassification?.price ?? 0,
      hasDiscount ? productClassification?.productDiscount?.discount : 0,
      DiscountTypeEnum.PERCENTAGE
    )

    const productTag = hasPreOrder
      ? OrderEnum.PRE_ORDER
      : hasDiscount
        ? OrderEnum.FLASH_SALE
        : product.status === ProductEnum.OFFICIAL
          ? ''
          : product.status

    const mockProduct = {
      id: product.id,
      name: product.name,
      tag: productTag,
      price: productClassification?.price ?? -1,
      currentPrice,
      images: product.images,
      deal: hasDiscount ? productClassification?.productDiscount?.discount : 0,
      flashSale: hasDiscount
        ? {
            productAmount: (productClassification?.productDiscount?.productClassifications ?? []).filter(
              (classification) => classification?.status === StatusEnum.ACTIVE
            )?.[0].quantity,
            soldAmount: 65
          }
        : null,
      description: product.description,
      detail: product.detail,
      rating: Number(product.averageRating),
      ratingAmount: Number(product.totalRatings),
      soldInPastMonth: Number(product.salesLast30Days),
      salesLast30Days: Number(product.salesLast30Days),
      classifications: productClassifications,
      certificates: product.certificates
    }

    return (
      <ProductCard key={product?.id} product={mockProduct} isProductDiscount={productTag === OrderEnum.FLASH_SALE} />
    )
  }

  const hasProducts = products?.data?.items && products.data.items.length > 0

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Feather name='star' size={20} color={myTheme.red[500]} />
          <Text style={styles.title}>{t('home.recommendProductsTitle')}</Text>
        </View>

        <Link href='/products/recommendProducts' style={styles.link}>
          <Text style={styles.linkText}>{t('button.viewAll')}</Text>
          <Feather name='arrow-right' size={16} color={myTheme.primary} />
        </Link>
      </View>

      {isLoading && (
        <View style={styles.loader}>
          <ActivityIndicator size='large' color={myTheme.primary} />
        </View>
      )}

      {!isLoading && !hasProducts && (
        <View style={styles.loader}>
          <Empty title={t('empty.recommendProducts.title')} description={t('empty.recommendProducts.description')} />
        </View>
      )}

      {!isLoading && hasProducts && (
        <FlatList
          data={products.data.items}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.productGrid}
          scrollEnabled={false}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: myTheme.primary
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  linkText: {
    color: myTheme.primary,
    marginRight: 4
  },
  loader: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  },
  productGrid: {
    justifyContent: 'space-between'
  }
})

export default RecommendProduct
