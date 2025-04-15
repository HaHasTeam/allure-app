import { IMasterConfig } from '@/types/master-config'
import { IOrder } from '@/types/order'

/**
 * Calculates the discounted price for an order detail.
 * @param orderDetail - The order detail object containing pricing and discount information.
 * @returns The discounted price after applying platform and shop vouchers.
 */
export function getOrderDetailDiscountPrice(orderDetail: {
  platformVoucherDiscount: number
  shopVoucherDiscount: number
  subTotal: number
}): number {
  if (!orderDetail) return 0

  const { platformVoucherDiscount, shopVoucherDiscount, subTotal } = orderDetail

  // Calculate total discount
  const totalDiscount = platformVoucherDiscount + shopVoucherDiscount

  // Ensure discounted price is not less than 0
  return Math.max(subTotal - totalDiscount, 0)
}

export const calculatePaymentCountdown = (order: IOrder, masterConfigData: IMasterConfig[]) => {
  const createdAt = new Date(order.createdAt).getTime()

  const autoCancelTime = parseInt(masterConfigData[0]?.autoCancelOrderTime ?? '') || 0

  const deadline = createdAt + autoCancelTime

  // Get the current time
  const now = new Date().getTime()

  const remainingTime = Math.max(0, Math.floor((deadline - now) / 1000))

  const hours = Math.floor(remainingTime / 3600)
  const minutes = Math.floor((remainingTime % 3600) / 60)
  const seconds = remainingTime % 60

  return { hours, minutes, seconds }
}
