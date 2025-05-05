import { hasActiveClassification, hasClassificationWithQuantity } from '../product'

import { ICartByBrand, ICartItem } from '@/types/cart'
import { IClassification } from '@/types/classification'
import { LiveStreamEnum, ProductDiscountEnum, ProductEnum, StatusEnum } from '@/types/enum'
import { IPreOrder, PreOrderProductEnum } from '@/types/pre-order'
import { IProduct } from '@/types/product'
import { IProductDiscount } from '@/types/product-discount'

export const createCheckoutItem = (cartItems: ICartItem[], selectedCartItems: string[]) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  if (selectedCartItems?.length > 0) {
    const filteredItems = cartItems?.filter((cart) => selectedCartItems?.includes(cart?.id))
    if (filteredItems?.length > 0) {
      return filteredItems.map((item) => ({
        classificationId: item?.productClassification?.id || '',
        quantity: item?.quantity || 0
      }))
    }
  }
  return cartItems?.map((item) => ({
    classificationId: item?.productClassification?.id || '',
    quantity: item?.quantity || 0
  }))
}

export const createCheckoutItems = (cartData: ICartByBrand, selectedCartItems: string[]) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return Object.entries(cartData).map(([_brandName, cartItems]) => ({
    brandId:
      cartItems[0]?.productClassification?.productDiscount?.product?.brand?.id ??
      cartItems[0]?.productClassification?.preOrderProduct?.product?.brand?.id ??
      cartItems[0]?.productClassification?.product?.brand?.id ??
      '',
    brandItems: createCheckoutItem(cartItems, selectedCartItems)
  }))
}

export const createCartFromProduct = (
  product: IProduct,
  quantity: number,
  productClassification: IClassification,
  liveStream: {
    discount: number
    id: string
    createdAt: string
    updatedAt: string
  }
): ICartByBrand => {
  const brandName = product?.brand?.name ?? ''
  const currentTime = new Date()
  const preOrderProduct: IPreOrder | null =
    product?.preOrderProducts?.find((item) => {
      const startTime = new Date(item.startTime)
      const endTime = new Date(item.endTime)

      return currentTime >= startTime && currentTime <= endTime && item.status === PreOrderProductEnum.ACTIVE
    }) ?? null
  const productDiscount: IProductDiscount | null =
    product?.productDiscounts?.find((item) => {
      const startTime = new Date(item.startTime)
      const endTime = new Date(item.endTime)

      return currentTime >= startTime && currentTime <= endTime && item.status === ProductDiscountEnum.ACTIVE
    }) ?? null
  const productLivestream = liveStream ?? null

  const cartItems: ICartItem = {
    id: product?.id,
    quantity,
    classification: productClassification?.title,
    status: StatusEnum.ACTIVE,
    productClassification: {
      ...productClassification,
      preOrderProduct: preOrderProduct
        ? {
            ...preOrderProduct,
            product: product?.id ? { ...product, brand: product?.brand } : ({} as IProduct)
          }
        : null,
      productDiscount: productDiscount
        ? {
            ...productDiscount,
            product: product?.id ? { ...product, brand: product?.brand } : ({} as IProduct)
          }
        : null,
      product: {
        ...product,
        brand: product?.brand,
        productDiscounts: productDiscount ? [productDiscount] : []
      }
    },
    livestream: productLivestream ? { ...productLivestream, status: LiveStreamEnum.LIVE } : undefined,
    livestreamDiscount: productLivestream?.discount ?? undefined
  }

  return {
    [brandName]: [cartItems]
  }
}

export const checkPreventAction = (cartItem: ICartItem) => {
  if (!cartItem) return true

  const product =
    cartItem?.productClassification?.preOrderProduct?.product ??
    cartItem?.productClassification?.productDiscount?.product ??
    cartItem?.productClassification?.product

  const productClassification = cartItem?.productClassification ?? null
  const classifications =
    productClassification?.preOrderProduct?.productClassifications ??
    productClassification?.productDiscount?.productClassifications ??
    productClassification?.product?.productClassifications ??
    []

  const productStatus = product?.status

  // check event status
  const EVENT_CANCELLED =
    (cartItem.livestream && cartItem.livestream.status === LiveStreamEnum.CANCELLED) ||
    (cartItem?.productClassification?.productDiscount &&
      cartItem?.productClassification?.productDiscount?.status === ProductDiscountEnum.CANCELLED) ||
    (cartItem?.productClassification?.preOrderProduct &&
      cartItem?.productClassification?.preOrderProduct?.status === PreOrderProductEnum.CANCELLED)
  const EVENT_ENDED = cartItem.livestream && cartItem.livestream.status === LiveStreamEnum.ENDED
  const EVENT_INACTIVE =
    (cartItem?.productClassification?.productDiscount &&
      cartItem?.productClassification?.productDiscount?.status === ProductDiscountEnum.INACTIVE) ||
    (cartItem?.productClassification?.preOrderProduct &&
      cartItem?.productClassification?.preOrderProduct?.status === PreOrderProductEnum.INACTIVE) ||
    false
  const EVENT_SOLD_OUT =
    (cartItem?.productClassification?.productDiscount &&
      cartItem?.productClassification?.productDiscount?.status === ProductDiscountEnum.SOLD_OUT) ||
    (cartItem?.productClassification?.preOrderProduct &&
      cartItem?.productClassification?.preOrderProduct?.status === PreOrderProductEnum.SOLD_OUT) ||
    false

  const HAS_ACTIVE_CLASSIFICATION = hasActiveClassification(classifications)
  const IN_STOCK_CLASSIFICATION = hasClassificationWithQuantity(classifications)
  const ACTIVE_PRODUCT_CLASSIFICATION = productClassification.status === StatusEnum.ACTIVE

  return (
    !HAS_ACTIVE_CLASSIFICATION ||
    !IN_STOCK_CLASSIFICATION ||
    !(productStatus === ProductEnum.FLASH_SALE || productStatus === ProductEnum.OFFICIAL) ||
    EVENT_CANCELLED ||
    EVENT_ENDED ||
    EVENT_INACTIVE ||
    EVENT_SOLD_OUT ||
    !ACTIVE_PRODUCT_CLASSIFICATION
  )
}

export const findCartItemById = (id: string, cartItems: ICartByBrand) => {
  for (const brandName in cartItems) {
    const item = cartItems[brandName].find((item) => item.id === id)
    if (item) return item
  }
  return null
}
