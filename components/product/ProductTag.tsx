import { useTranslation } from 'react-i18next'
import { StyleSheet, View, Text } from 'react-native'

import { myTheme } from '@/constants'
import { OrderEnum, PaymentMethod, ProductCartStatusEnum, ProductEnum } from '@/types/enum'
import { PreOrderProductEnum } from '@/types/pre-order'

interface ProductTagProps {
  tag: string
  text?: string
  size?: 'small' | 'medium' | 'large'
}

export default function ProductTag({ tag, text, size = 'small' }: ProductTagProps) {
  const { t } = useTranslation()
  let tagStyle = {}
  let textStyle = {}
  let tagText = ''

  const sizeStyles = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large
  }
  //   let tagColorClass = ''
  //   let tagText = ''
  //   const sizeClasses = {
  //     small: 'px-1 text-xs',
  //     medium: 'px-2 py-1 text-sm sm:text-xs',
  //     large: 'p-3 lg:text-base md:text-sm sm:text-xs',
  //   }

  // Define color based on tag
  switch (tag) {
    case 'Best Seller':
      tagStyle = styles.bestSeller
      textStyle = styles.bestSellerText
      tagText = t('productTag.bestSeller')
      break
    case 'Limited Edition':
      tagStyle = styles.limitedEdition
      textStyle = styles.limitedEditionText
      tagText = t('productTag.limitedEdition')
      break
    case 'New Arrival':
      tagStyle = styles.newArrival
      textStyle = styles.newArrivalText
      tagText = t('productTag.newArrival')
      break
    case 'Hot Deal':
      tagStyle = styles.hotDeal
      textStyle = styles.hotDealText
      tagText = t('productTag.hotDeal')
      break
    case 'DealPercent':
      textStyle = styles.dealPercentText
      tagStyle = styles.dealPercent
      break
    case ProductCartStatusEnum.HIDDEN: // use for product in cart
      tagStyle = styles.productHidden
      textStyle = styles.productHiddenText
      tagText = t('productTag.hidden')
      break
    case ProductCartStatusEnum.SOLD_OUT: // use for product in cart
      tagStyle = styles.productSoldOut
      textStyle = styles.productSoldOutText
      tagText = t('productTag.outOfStock')
      break
    case ProductCartStatusEnum.BANNED: // use for product in cart
      tagStyle = styles.productBanned
      textStyle = styles.productBannedText
      tagText = t('productTag.banned')
      break
    case ProductCartStatusEnum.UN_PUBLISHED: // use for product in cart
      tagStyle = styles.productUnpublished
      textStyle = styles.productUnpublishedText
      tagText = t('productTag.unPublished')
      break
    case ProductCartStatusEnum.INACTIVE: // use for product in cart
      tagStyle = styles.productInactive
      textStyle = styles.productInactiveText
      tagText = t('productTag.inactive')
      break
    case ProductEnum.OUT_OF_STOCK: // use for product in cart
      tagStyle = styles.productOutOfStock
      textStyle = styles.productOutOfStockText
      tagText = t('productTag.outOfStock')
      break
    case OrderEnum.FLASH_SALE:
      tagStyle = styles.flashSale
      textStyle = styles.flashSaleText
      tagText = t('productTag.flashSale')
      break
    case OrderEnum.LIVE_STREAM:
      tagStyle = styles.liveStream
      textStyle = styles.liveStreamText
      tagText = t('productTag.liveStream')
      break
    case OrderEnum.GROUP_BUYING:
      textStyle = styles.orderGroupBuyingText
      tagStyle = styles.orderGroupBuying
      tagText = t('productTag.groupBuying')
      break
    case OrderEnum.PRE_ORDER:
      textStyle = styles.orderPreOrderText
      tagStyle = styles.orderPreOrder
      tagText = t('productTag.preOrder')
      break
    case PreOrderProductEnum.WAITING:
      tagStyle = styles.preOrderWaiting
      textStyle = styles.preOrderWaitingText
      tagText = t('productTag.waiting')
      break
    case PreOrderProductEnum.ACTIVE:
      tagStyle = styles.preOrderActive
      textStyle = styles.preOrderActiveText
      tagText = t('productTag.preOrder')
      break
    case PreOrderProductEnum.CANCELLED:
      tagStyle = styles.preOrderCancelled
      textStyle = styles.preOrderCancelledText
      tagText = t('productTag.cancelled')
      break
    case ProductCartStatusEnum.CANCELLED:
      tagStyle = styles.preOrderCancelled
      textStyle = styles.preOrderCancelledText
      tagText = t('productTag.eventCancelled')
      break
    case ProductCartStatusEnum.ENDED:
      tagStyle = styles.preOrderCancelled
      textStyle = styles.preOrderCancelledText
      tagText = t('productTag.eventEnded')
      break
    case PreOrderProductEnum.INACTIVE:
      tagStyle = styles.preOrderInactive
      textStyle = styles.preOrderInactiveText
      tagText = t('productTag.inactive')
      break
    case PreOrderProductEnum.SOLD_OUT:
      tagStyle = styles.preOrderSoldOut
      textStyle = styles.preOrderSoldOutText
      tagText = t('productTag.outOfStock')
      break
    // for payment methods
    case PaymentMethod.CARD:
      tagStyle = styles.paymentCard
      textStyle = styles.paymentCardText
      tagText = t('paymentMethod.tag.cash')
      break
    case PaymentMethod.CASH:
      tagStyle = styles.paymentCash
      textStyle = styles.paymentCashText
      tagText = t('paymentMethod.tag.card')
      break
    case PaymentMethod.WALLET:
      tagStyle = styles.paymentWallet
      textStyle = styles.paymentWalletText
      tagText = t('paymentMethod.tag.wallet')
      break
    default:
      tagStyle = styles.defaultTag
      textStyle = styles.defaultText
      tagText = tag
      break
  }

  return (
    <View style={[styles.tagContainer, sizeStyles[size], tagStyle]}>
      <Text style={[styles.text, textStyle]}>{text ? text : tagText}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  defaultText: {
    color: myTheme.foreground
  },
  bestSeller: {
    backgroundColor: myTheme.yellow[200],
    color: myTheme.yellow[800]
  },
  limitedEdition: {
    backgroundColor: myTheme.purple[200],
    color: myTheme.purple[800]
  },
  newArrival: {
    backgroundColor: myTheme.blue[200],
    color: myTheme.blue[800]
  },
  hotDeal: {
    backgroundColor: myTheme.red[200],
    color: myTheme.red[800]
  },
  dealPercent: {
    backgroundColor: myTheme.red[100],
    color: myTheme.red[500]
  },
  productHidden: {
    backgroundColor: myTheme.gray[200],
    color: myTheme.gray[800]
  },
  productSoldOut: {
    backgroundColor: myTheme.red[100],
    color: myTheme.red[500]
  },
  productBanned: {
    backgroundColor: myTheme.red[200],
    color: myTheme.red[700]
  },
  productUnpublished: {
    backgroundColor: myTheme.yellow[100],
    color: myTheme.yellow[500]
  },
  productInactive: {
    backgroundColor: myTheme.gray[100],
    color: myTheme.gray[500]
  },
  productOutOfStock: {
    backgroundColor: myTheme.red[100],
    color: myTheme.red[500]
  },
  flashSale: {
    backgroundColor: myTheme.rose[200],
    color: myTheme.white
  },
  liveStream: {
    backgroundColor: myTheme.purple[500],
    color: myTheme.white,
    borderWidth: 1,
    borderColor: myTheme.purple[500]
  },
  orderGroupBuying: {
    backgroundColor: myTheme.white,
    color: myTheme.orange[500],
    borderWidth: 1,
    borderColor: myTheme.orange[500]
  },
  orderPreOrder: {
    backgroundColor: myTheme.yellow[500],
    color: myTheme.white,
    borderWidth: 1,
    borderColor: myTheme.yellow[500]
  },
  preOrderWaiting: {
    backgroundColor: myTheme.yellow[100],
    color: myTheme.yellow[800],
    borderWidth: 1,
    borderColor: myTheme.yellow[300]
  },
  preOrderActive: {
    backgroundColor: myTheme.green[100],
    color: myTheme.green[800],
    borderWidth: 1,
    borderColor: myTheme.green[300]
  },
  preOrderCancelled: {
    backgroundColor: myTheme.red[100],
    color: myTheme.red[800],
    borderWidth: 1,
    borderColor: myTheme.red[300]
  },
  preOrderInactive: {
    backgroundColor: myTheme.gray[100],
    color: myTheme.gray[800],
    borderWidth: 1,
    borderColor: myTheme.gray[300]
  },
  preOrderSoldOut: {
    backgroundColor: myTheme.blue[100],
    color: myTheme.blue[800],
    borderWidth: 1,
    borderColor: myTheme.blue[300]
  },
  paymentCard: {
    backgroundColor: myTheme.white,
    color: myTheme.yellow[500],
    borderWidth: 1,
    borderColor: myTheme.yellow[500]
  },
  paymentCash: {
    backgroundColor: myTheme.white,
    color: myTheme.orange[500],
    borderWidth: 1,
    borderColor: myTheme.orange[500]
  },
  paymentWallet: {
    backgroundColor: myTheme.white,
    color: myTheme.purple[500],
    borderWidth: 1,
    borderColor: myTheme.purple[500]
  },
  tagContainer: {
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 4,
    fontWeight: 500,
    alignSelf: 'center'
  },
  text: {
    fontWeight: '500',
    fontSize: 12
  },
  small: {
    paddingHorizontal: 4,
    fontSize: 10
  },
  medium: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12
  },
  large: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 16
  },
  defaultTag: {
    backgroundColor: myTheme.gray[200],
    color: myTheme.gray[800]
  },
  bestSellerText: {
    color: myTheme.yellow[800]
  },
  limitedEditionText: {
    color: myTheme.purple[800]
  },
  newArrivalText: {
    color: myTheme.blue[800]
  },
  hotDealText: {
    color: myTheme.red[800]
  },
  dealPercentText: {
    color: myTheme.red[500]
  },
  productHiddenText: {
    color: myTheme.gray[800]
  },
  productSoldOutText: {
    color: myTheme.red[500]
  },
  productBannedText: {
    color: myTheme.red[700]
  },
  productUnpublishedText: {
    color: myTheme.yellow[500]
  },
  productInactiveText: {
    color: myTheme.gray[500]
  },
  productOutOfStockText: {
    color: myTheme.red[500]
  },
  flashSaleText: {
    color: myTheme.white
  },
  liveStreamText: {
    color: myTheme.white
  },
  orderGroupBuyingText: {
    color: myTheme.orange[500]
  },
  orderPreOrderText: {
    color: myTheme.white
  },
  preOrderWaitingText: {
    color: myTheme.yellow[800]
  },
  preOrderActiveText: {
    color: myTheme.green[800]
  },
  preOrderCancelledText: {
    color: myTheme.red[800]
  },
  preOrderInactiveText: {
    color: myTheme.gray[800]
  },
  preOrderSoldOutText: {
    color: myTheme.blue[800]
  },
  paymentCardText: {
    color: myTheme.yellow[500]
  },
  paymentCashText: {
    color: myTheme.orange[500]
  },
  paymentWalletText: {
    color: myTheme.purple[500]
  }
})
