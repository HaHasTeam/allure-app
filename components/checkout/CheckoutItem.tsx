'use client'

import { Feather } from '@expo/vector-icons'
import type { BottomSheetModal } from '@gorhom/bottom-sheet'
import { useMemo, useRef, useState } from 'react'
import type { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import type { z } from 'zod'

import BrandSection from '../brand/BrandSection'
import ProductCheckoutLandscape from '../product/ProductCheckoutLandscape'
import VoucherBrandList from '../voucher/VoucherBrandList'

import { myTheme } from '@/constants'
import type { CreateOrderSchema } from '@/schema/order.schema'
import useCartStore from '@/store/cart'
import type { IBrand } from '@/types/brand'
import type { ICartItem } from '@/types/cart'
import {
  ClassificationTypeEnum,
  DiscountTypeEnum,
  LiveStreamEnum,
  OrderEnum,
  ProductDiscountEnum,
  StatusEnum
} from '@/types/enum'
import { PreOrderProductEnum } from '@/types/pre-order'
import type { IBrandBestVoucher, ICheckoutItem, TVoucher } from '@/types/voucher'
import { formatCurrency, formatNumber } from '@/utils/number'
import { calculateCheckoutBrandVoucherDiscount } from '@/utils/price'

interface CheckoutItemProps {
  brandName: string
  cartBrandItem: ICartItem[]
  onVoucherSelect: (brandId: string, voucher: TVoucher | null) => void
  chosenBrandVoucher: TVoucher | null
  bestVoucherForBrand: IBrandBestVoucher
  brand?: IBrand
  index: number
  isInGroupBuying?: boolean
  watch: UseFormWatch<z.infer<typeof CreateOrderSchema>>
  register: UseFormRegister<z.infer<typeof CreateOrderSchema>>
  setValue: UseFormSetValue<z.infer<typeof CreateOrderSchema>>
}
const CheckoutItem = ({
  brandName,
  isInGroupBuying = false,
  cartBrandItem,
  onVoucherSelect,
  bestVoucherForBrand,
  chosenBrandVoucher,
  brand,
  index,
  register,
  setValue,
  watch
}: CheckoutItemProps) => {
  const { t } = useTranslation()

  const messageFieldName = `orders.${index}.message` as const

  const currentMessage = watch(messageFieldName)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const toggleModalVisibility = () => {
    if (isModalVisible) {
      bottomSheetModalRef.current?.close() // Close modal if it's visible
    } else {
      bottomSheetModalRef.current?.present() // Open modal if it's not visible
    }
    setIsModalVisible(!isModalVisible) // Toggle the state
  }

  const totalBrandPrice = useMemo(() => {
    return cartBrandItem.reduce((total, item) => {
      const price = item.productClassification?.price || 0
      const quantity = item.quantity || 0
      const hasLivestreamDiscount = item.livestreamDiscount !== undefined && item.livestreamDiscount > 0
      const discountAmount = hasLivestreamDiscount ? price * (item.livestreamDiscount ?? 0) : 0
      const finalPrice = price - discountAmount

      return total + finalPrice * quantity
    }, 0)
  }, [cartBrandItem])
  const checkoutItems: ICheckoutItem[] = cartBrandItem
    ?.map((cartItem) => ({
      classificationId: cartItem.productClassification?.id ?? '',
      quantity: cartItem.quantity ?? 0
    }))
    ?.filter((item) => item.classificationId !== null)
  const handleVoucherChange = (voucher: TVoucher | null) => {
    onVoucherSelect(brand?.id ?? '', voucher)
  }
  const voucherDiscount = useMemo(
    () => calculateCheckoutBrandVoucherDiscount(cartBrandItem, chosenBrandVoucher),
    [cartBrandItem, chosenBrandVoucher]
  )
  const { groupBuying } = useCartStore()
  const criteria = groupBuying?.groupProduct.criterias[0]
  return (
    <View style={[styles.gap, styles.checkoutItemContainer]}>
      {/* Brand Header */}
      {brand && <BrandSection brandId={brand.id} brandName={brand.name} brandLogo={brand.logo} />}
      <View style={styles.container}>
        {/* Product Cards */}
        <ScrollView>
          {cartBrandItem?.map((cartItem) => {
            console.log('cartItem', cartItem)

            const product =
              cartItem?.productClassification?.preOrderProduct?.product ??
              cartItem?.productClassification?.productDiscount?.product ??
              cartItem?.productClassification?.product
            const productClassification = cartItem?.productClassification ?? null
            // const productImage = cartItem?.productClassification?.images?.[0]?.fileUrl ?? ''
            const productImage =
              (cartItem?.productClassification?.type === ClassificationTypeEnum.DEFAULT
                ? product?.images?.filter((img) => img?.status === StatusEnum.ACTIVE)[0]?.fileUrl
                : cartItem?.productClassification?.images?.filter((img) => img?.status === StatusEnum.ACTIVE)[0]
                    ?.fileUrl) ?? ''

            const productName = product?.name ?? ''
            const productId = product?.id ?? ''
            const selectedClassification = cartItem?.classification ?? ''
            const productPrice = cartItem?.productClassification?.price ?? 0
            const productQuantity = cartItem?.quantity ?? 0
            // Check if this item is from a livestream
            const isLivestreamItem = cartItem.livestream && cartItem.livestream.status === LiveStreamEnum.LIVE

            let eventType = ''
            if (isInGroupBuying) {
              eventType = ''
            } else if (isLivestreamItem) {
              eventType = OrderEnum.LIVE_STREAM
            } else if (
              cartItem?.productClassification?.preOrderProduct &&
              cartItem?.productClassification?.preOrderProduct?.status === PreOrderProductEnum.ACTIVE
            ) {
              eventType = OrderEnum.PRE_ORDER
            } else if (
              cartItem?.productClassification?.productDiscount &&
              cartItem?.productClassification?.productDiscount?.status === ProductDiscountEnum.ACTIVE
            ) {
              eventType = OrderEnum.FLASH_SALE
            }
            const discount = isInGroupBuying
              ? null
              : eventType === OrderEnum.FLASH_SALE
                ? cartItem?.productClassification?.productDiscount?.discount
                : isLivestreamItem
                  ? cartItem.livestreamDiscount
                  : null

            const discountType = isInGroupBuying
              ? null
              : eventType === OrderEnum.FLASH_SALE || eventType === OrderEnum.LIVE_STREAM
                ? DiscountTypeEnum.PERCENTAGE
                : null

            return (
              <ProductCheckoutLandscape
                key={cartItem?.id}
                productImage={productImage}
                productName={productName}
                selectedClassification={selectedClassification}
                discount={discount}
                discountType={discountType}
                price={productPrice}
                productId={productId}
                eventType={eventType}
                productQuantity={productQuantity}
                productClassification={productClassification}
                // livestreamDiscount={cartItem?.livestreamDiscount}
              />
            )
          })}
        </ScrollView>
        {/* Message and brand voucher */}
        {!isInGroupBuying && (
          <View style={styles.voucherSection}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t('input.message')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('input.message')}
                value={currentMessage || ''}
                onChangeText={(text) => {
                  // Update the form value for this specific brand's message
                  setValue(messageFieldName, text, {
                    shouldValidate: true
                  })
                }}
                {...register(messageFieldName)}
              />
            </View>
            <View
              style={[
                styles.voucherContainer,
                (!bestVoucherForBrand || !bestVoucherForBrand.bestVoucher) && styles.flex
              ]}
            >
              <View style={styles.voucherContentContainer}>
                <Feather name='tag' size={16} color='red' />
                <Text>
                  {chosenBrandVoucher
                    ? chosenBrandVoucher?.discountType === DiscountTypeEnum.AMOUNT && voucherDiscount
                      ? t('voucher.discountAmount', { amount: voucherDiscount })
                      : t('voucher.discountAmount', { amount: voucherDiscount })
                    : bestVoucherForBrand?.bestVoucher
                      ? bestVoucherForBrand?.bestVoucher?.discountType === DiscountTypeEnum.AMOUNT &&
                        bestVoucherForBrand?.bestVoucher?.discountValue
                        ? t('voucher.bestDiscountAmountDisplay', {
                            amount: bestVoucherForBrand?.bestVoucher?.discountValue
                          })
                        : t('voucher.bestDiscountPercentageDisplay', {
                            percentage: bestVoucherForBrand?.bestVoucher?.discountValue * 100
                          })
                      : null}
                </Text>
              </View>
              <VoucherBrandList
                triggerText={t('cart.viewMoreVoucher')}
                brandName={brand?.name ?? ''}
                brandLogo={brand?.logo ?? ''}
                brandId={brand?.id ?? ''}
                hasBrandProductSelected
                checkoutItems={checkoutItems}
                selectedCheckoutItems={checkoutItems}
                handleVoucherChange={handleVoucherChange}
                bestVoucherForBrand={bestVoucherForBrand}
                chosenBrandVoucher={chosenBrandVoucher}
                voucherDiscount={voucherDiscount}
                setIsModalVisible={setIsModalVisible}
                toggleModalVisibility={toggleModalVisibility}
                bottomSheetModalRef={bottomSheetModalRef}
              />
            </View>
          </View>
        )}

        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>
            {t('cart.total')} ({cartBrandItem?.length} {t('cart.products')}):
          </Text>
          <Text style={styles.priceText}>
            {t('productCard.currentPrice', {
              price: totalBrandPrice - (voucherDiscount ?? 0)
            })}
          </Text>
        </View>

        {groupBuying && (
          <View style={styles.groupBuyingContainer}>
            <View style={styles.rowContainer}>
              <Text>{t('cart.wishDiscount')}:</Text>
              <Text style={styles.discountText}>
                {criteria?.voucher.discountType === DiscountTypeEnum.PERCENTAGE
                  ? formatNumber(String(criteria?.voucher?.discountValue ?? 0), '%')
                  : formatCurrency(criteria?.voucher.discountValue ?? 0)}
              </Text>
            </View>
            <View style={styles.rowContainer}>
              <Text>{t('cart.maxPrice')}:</Text>
              <Text style={styles.maxPriceText}>
                {t('format.currency', {
                  value:
                    criteria?.voucher.discountType === DiscountTypeEnum.PERCENTAGE
                      ? (totalBrandPrice * (100 - criteria?.voucher.discountValue)) / 100
                      : totalBrandPrice - (criteria?.voucher?.discountValue ?? 0) <= 0
                        ? 0
                        : totalBrandPrice - (criteria?.voucher?.discountValue ?? 0)
                })}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  )
}

export default CheckoutItem

const styles = StyleSheet.create({
  checkoutItemContainer: {
    paddingHorizontal: 5,
    paddingTop: 10,
    backgroundColor: myTheme.white,
    borderRadius: 6
  },
  flex: {
    flexDirection: 'row'
  },
  gap: {
    gap: 6
  },
  container: {
    width: '100%',
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 8,
    shadowOpacity: 0.1,
    shadowRadius: 3,
    marginBottom: 10
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10
  },
  brandName: {
    fontSize: 16,
    fontWeight: '500'
  },
  chatButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    padding: 6,
    borderRadius: 5,
    alignItems: 'center'
  },
  chatText: {
    color: 'white',
    marginLeft: 5
  },
  voucherSection: {
    flexDirection: 'column',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    paddingVertical: 10
  },
  inputContainer: {
    flexDirection: 'column',
    width: '100%',
    marginBottom: 10
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    width: '100%'
  },
  voucherContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  voucherContainer: { gap: 3 },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10
  },
  totalText: {
    fontSize: 14,
    color: '#666'
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'red'
  },
  groupBuyingContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    width: '100%',
    marginTop: 10
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  discountText: {
    fontSize: 18,
    textAlign: 'right'
  },
  maxPriceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
    textAlign: 'right'
  }
})
