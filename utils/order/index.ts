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
