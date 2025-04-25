/* eslint-disable @typescript-eslint/no-unused-vars */
import { Entypo, Feather, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import { BottomSheetModal } from '@gorhom/bottom-sheet'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'expo-router'
import { Dispatch, SetStateAction, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, TouchableOpacity, Text } from 'react-native'
import { View } from 'react-native-ui-lib'

import TotalPriceDetail from './TotalPriceDetail'
import Confirmation from '../confirmation/Confirmation'
import VoucherPlatformList from '../voucher/VoucherPlatformList'

import { myTheme } from '@/constants'
import { useToast } from '@/contexts/ToastContext'
import { getMyCartApi, removeAllCartItemApi } from '@/hooks/api/cart'
import useHandleServerError from '@/hooks/useHandleServerError'
import { ICartByBrand } from '@/types/cart'
import { DiscountTypeEnum, ProjectInformationEnum } from '@/types/enum'
import { IPlatformBestVoucher, TVoucher } from '@/types/voucher'
import { hexToRgba } from '@/utils/color'

interface CartFooterProps {
  cartItemCountAll: number
  cartItemCount: number
  onCheckAll: () => void
  isAllSelected: boolean
  selectedCartItems: string[]
  setSelectedCartItems: Dispatch<SetStateAction<string[]>>
  totalProductDiscount: number
  totalVoucherDiscount: number
  totalOriginalPrice: number
  totalFinalPrice: number
  savedPrice: number
  platformChosenVoucher: TVoucher | null
  setPlatformChosenVoucher: Dispatch<SetStateAction<TVoucher | null>>
  platformVoucherDiscount: number
  cartByBrand: ICartByBrand
  bestPlatformVoucher: IPlatformBestVoucher | null
}
export default function CartFooter({
  cartItemCountAll,
  cartItemCount,
  onCheckAll,
  isAllSelected,
  setSelectedCartItems,
  platformChosenVoucher,
  setPlatformChosenVoucher,
  totalFinalPrice,
  platformVoucherDiscount,
  cartByBrand,
  totalOriginalPrice,
  selectedCartItems,
  totalProductDiscount,
  totalVoucherDiscount,
  savedPrice,
  bestPlatformVoucher
}: CartFooterProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const handleServerError = useHandleServerError()
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [openWarningDialog, setOpenWarningDialog] = useState(false)
  const [openVoucherList, setOpenVoucherList] = useState(false)
  const [openTotalPrice, setOpenTotalPrice] = useState(false)
  const [openConfirmDeleteAllCartDialog, setOpenConfirmDeleteAllCartDialog] = useState(false)

  const bottomSheetModalRef = useRef<BottomSheetModal>(null)
  const toggleModalVisibility = () => {
    if (openConfirmDeleteAllCartDialog) {
      bottomSheetModalRef.current?.close() // Close modal if it's visible
    } else {
      bottomSheetModalRef.current?.present() // Open modal if it's not visible
    }
    setOpenConfirmDeleteAllCartDialog(!openConfirmDeleteAllCartDialog) // Toggle the state
  }

  const bottomSheetPlatformVoucherModalRef = useRef<BottomSheetModal>(null)
  const togglePlatformVoucherVisibility = () => {
    if (openVoucherList) {
      bottomSheetPlatformVoucherModalRef.current?.close() // Close modal if it's visible
    } else {
      bottomSheetPlatformVoucherModalRef.current?.present() // Open modal if it's not visible
    }
    setOpenVoucherList(!openVoucherList) // Toggle the state
  }
  const bottomSheetTotalPriceModalRef = useRef<BottomSheetModal>(null)
  const toggleTotalPriceVisibility = () => {
    if (openVoucherList) {
      bottomSheetTotalPriceModalRef.current?.close() // Close modal if it's visible
    } else {
      bottomSheetTotalPriceModalRef.current?.present() // Open modal if it's not visible
    }
    setOpenTotalPrice(!openTotalPrice) // Toggle the state
  }

  const insufficientStockItems = useMemo(() => {
    return Object.values(cartByBrand)
      .flat()
      .filter(
        (cartItem) =>
          selectedCartItems.includes(cartItem.id) &&
          cartItem.quantity &&
          cartItem.productClassification?.quantity !== undefined &&
          cartItem.quantity > cartItem.productClassification.quantity
      )
  }, [cartByBrand, selectedCartItems])
  const soldOutItems = useMemo(() => {
    return Object.values(cartByBrand)
      .flat()
      .filter(
        (cartItem) =>
          selectedCartItems.includes(cartItem.id) &&
          cartItem.quantity &&
          cartItem.productClassification?.quantity !== undefined &&
          cartItem.productClassification.quantity === 0
      )
  }, [cartByBrand, selectedCartItems])

  const handleVoucherChange = (voucher: TVoucher | null) => {
    setPlatformChosenVoucher(voucher)
  }

  // handle checkout button
  const handleCheckout = () => {
    if (selectedCartItems && selectedCartItems?.length > 0) {
      if (insufficientStockItems?.length > 0 || soldOutItems?.length > 0) {
        showToast(
          insufficientStockItems.length > 0
            ? t('warning.cart.insufficientStockDescription', {
                products: insufficientStockItems
                  .map(
                    (item) =>
                      item.productClassification?.preOrderProduct?.product?.name ??
                      item.productClassification?.productDiscount?.product?.name ??
                      item.productClassification?.product?.name
                  )
                  .join(', ')
              })
            : soldOutItems?.length > 0
              ? t('warning.cart.insufficientStockDescription', {
                  products: insufficientStockItems
                    .map(
                      (item) =>
                        item.productClassification?.preOrderProduct?.product?.name ??
                        item.productClassification?.productDiscount?.product?.name ??
                        item.productClassification?.product?.name
                    )
                    .join(', ')
                })
              : t('warning.cart.description'),
          'error',
          4000
        )
      } else {
        router.push('/checkout')
      }
    } else setOpenWarningDialog(true)
  }

  // handle remove cart items api starts
  const { mutateAsync: removeAllCartItemFn } = useMutation({
    mutationKey: [removeAllCartItemApi.mutationKey],
    mutationFn: removeAllCartItemApi.fn,
    onSuccess: () => {
      showToast(t('delete.cart.success', { amount: t('delete.cart.All') }), 'success', 4000)
      queryClient.invalidateQueries({
        queryKey: [getMyCartApi.queryKey]
      })
    }
  })

  // handle remove cart items function starts
  async function handleRemoveAllCartItem() {
    try {
      await removeAllCartItemFn()
    } catch (error) {
      console.log(error)
      handleServerError({
        error
      })
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Voucher Section */}
        <View style={[styles.commonFlex, styles.spaceBetween]}>
          <View style={styles.commonFlex}>
            <MaterialIcons name='discount' size={24} color={myTheme.red[500]} />
            <Text>
              {ProjectInformationEnum.name} {t('cart.voucher')}
            </Text>
          </View>
          <TouchableOpacity onPress={() => togglePlatformVoucherVisibility()}>
            <Text />
          </TouchableOpacity>

          <VoucherPlatformList
            triggerText={
              <View>
                {platformChosenVoucher ? (
                  platformChosenVoucher?.discountType === DiscountTypeEnum.AMOUNT &&
                  platformChosenVoucher?.discountValue ? (
                    <View style={styles.commonFlex}>
                      <Text style={styles.link}>
                        {t('voucher.discountAmount', {
                          amount: platformVoucherDiscount
                        })}
                      </Text>
                      <MaterialCommunityIcons name='pencil' size={16} color={myTheme.blue[500]} />
                    </View>
                  ) : (
                    <View style={styles.commonFlex}>
                      <Text style={styles.link}>
                        {t('voucher.discountAmount', {
                          amount: platformVoucherDiscount
                        })}
                      </Text>
                      <MaterialCommunityIcons name='pencil' size={16} color={myTheme.blue[500]} />
                    </View>
                  )
                ) : bestPlatformVoucher?.bestVoucher ? (
                  bestPlatformVoucher?.bestVoucher?.discountType === DiscountTypeEnum.AMOUNT &&
                  bestPlatformVoucher?.bestVoucher?.discountValue ? (
                    <Text style={styles.link}>
                      {t('voucher.bestDiscountAmountDisplay', {
                        amount: bestPlatformVoucher?.bestVoucher?.discountValue
                      })}
                    </Text>
                  ) : (
                    <Text style={styles.link}>
                      {t('voucher.bestDiscountPercentageDisplay', {
                        percentage: bestPlatformVoucher?.bestVoucher?.discountValue * 100
                      })}
                    </Text>
                  )
                ) : (
                  <Text style={styles.link}>{t('cart.selectVoucher')}</Text>
                )}
              </View>
            }
            bestPlatFormVoucher={bestPlatformVoucher}
            onConfirmVoucher={setPlatformChosenVoucher}
            selectedCartItems={selectedCartItems}
            chosenPlatformVoucher={platformChosenVoucher}
            cartByBrand={cartByBrand}
            bottomSheetModalRef={bottomSheetPlatformVoucherModalRef}
            setIsModalVisible={setOpenVoucherList}
            toggleModalVisibility={togglePlatformVoucherVisibility}
            handleVoucherChange={handleVoucherChange}
          />
        </View>
        {/* Total Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.rightSection}>
            <View style={styles.totalSection}>
              <View style={styles.totalRow}>
                <View style={styles.buttonGroup}>
                  <TouchableOpacity style={styles.deleteButton} onPress={() => toggleModalVisibility()}>
                    <Feather name='trash-2' size={24} color={myTheme.white} />
                    <Text style={styles.buttonText}>{t('cart.removeAll')}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.commonFlex}>
                  <Text style={styles.totalLabel}>
                    {t('cart.total')} ({cartItemCount} {t('cart.products')}):
                  </Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.finalPrice}>{t('productCard.price', { price: totalFinalPrice })}</Text>
                  </View>
                </View>
              </View>
              {savedPrice && savedPrice > 0 ? (
                <TouchableOpacity onPress={() => toggleTotalPriceVisibility()} style={styles.savedContainer}>
                  <View style={styles.commonFlex}>
                    <Text style={styles.savedText}>
                      {t('cart.saved')}:
                      <Text style={styles.savedAmount}> {t('productCard.price', { price: savedPrice })}</Text>
                    </Text>
                  </View>
                  <Entypo name='chevron-down' size={12} color={myTheme.green[500]} />
                </TouchableOpacity>
              ) : null}
              {/* Price total bottom sheet */}
              <TotalPriceDetail
                toggleModalVisibility={toggleTotalPriceVisibility}
                setIsModalVisible={setOpenTotalPrice}
                bottomSheetModalRef={bottomSheetTotalPriceModalRef}
                totalProductDiscount={totalProductDiscount}
                totalBrandDiscount={totalVoucherDiscount}
                totalPlatformDiscount={platformVoucherDiscount}
                totalPayment={totalFinalPrice}
                totalSavings={savedPrice}
                totalProductCost={totalOriginalPrice}
              />
            </View>
            <TouchableOpacity
              style={[styles.checkoutButton, selectedCartItems?.length === 0 && styles.buttonDisabled]}
              onPress={handleCheckout}
              disabled={selectedCartItems?.length === 0}
            >
              <Text style={styles.checkoutButtonText}>{t('cart.checkout')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <Confirmation
        action='delete'
        item='cart'
        title={t('delete.cart.title', { amount: t('delete.cart.all') })}
        description={t('delete.cart.description', {
          amount: t('delete.cart.all')
        })}
        onConfirm={() => {
          // Handle delete multiple confirmation
          handleRemoveAllCartItem()
          setOpenConfirmDeleteAllCartDialog(false)
        }}
        bottomSheetModalRef={bottomSheetModalRef}
        setIsModalVisible={setOpenConfirmDeleteAllCartDialog}
        toggleModalVisibility={toggleModalVisibility}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  link: {
    color: myTheme.blue[500]
  },
  spaceBetween: {
    justifyContent: 'space-between'
  },
  commonFlex: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center'
  },
  checkbox: {
    alignSelf: 'center',
    borderRadius: 6
  },
  container: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: myTheme.gray[200],
    backgroundColor: myTheme.white,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4
  },
  content: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  sectionContainer: {
    flexDirection: 'column'
  },
  leftSection: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: hexToRgba(myTheme.primary, 0.2)
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  destructiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: myTheme.destructive,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    gap: 8
  },
  deleteButton: {
    backgroundColor: myTheme.rose[500],
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8
  },
  buttonText: {
    color: myTheme.white,
    fontSize: 14,
    fontWeight: 600
  },
  rightSection: {
    width: '100%',
    paddingTop: 4,
    gap: 6
  },
  totalSection: {
    gap: 3
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'space-between',
    width: '100%'
  },
  totalLabel: {
    fontSize: 16
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  finalPrice: {
    fontSize: 18,
    fontWeight: '500',
    color: myTheme.red[500]
  },
  savedContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    marginLeft: 'auto'
  },
  savedText: {
    fontSize: 14,
    color: myTheme.green[500]
  },
  savedAmount: {
    fontSize: 14,
    color: myTheme.green[500],
    fontWeight: 'semibold'
  },
  checkoutButton: {
    backgroundColor: myTheme.primary,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 30
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  buttonDisabled: {
    // backgroundColor: "#ccc",
    opacity: 0.5
  }
})
