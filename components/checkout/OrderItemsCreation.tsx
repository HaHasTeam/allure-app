import type { z } from "zod";

import type { ICartByBrand } from "@/types/cart";
import type { ICreateOrderItem } from "@/types/order";
import type { TVoucher } from "@/types/voucher";
import type { CreateOrderSchema } from "@/schema/order.schema";

interface OrderItemProps {
  selectedCartItem: ICartByBrand | null;
  chosenBrandVouchers: { [brandId: string]: TVoucher | null };
  values: z.infer<typeof CreateOrderSchema>;
}
export const OrderItemCreation = ({
  values,
  selectedCartItem,
  chosenBrandVouchers,
}: OrderItemProps) => {
  // Map selectedCartItem to orders[]
  const orders: ICreateOrderItem[] = selectedCartItem
    ? Object.keys(selectedCartItem).map((brandName, index) => {
        const cartBrandItems = selectedCartItem[brandName];
        console.log("cartBrandItems", cartBrandItems);

        // Map items to the required structure
        const items =
          cartBrandItems?.map((item) => ({
            productClassificationId: item?.productClassification?.id ?? "",
            quantity: item?.quantity,
            livestreamId: item?.livestream || undefined,
          })) ?? [];
        console.log("checkItems", items);

        // Use the brandId to find the corresponding voucher
        const brand =
          selectedCartItem[brandName]?.[0]?.productClassification
            ?.productDiscount?.product?.brand ??
          selectedCartItem[brandName]?.[0]?.productClassification
            ?.preOrderProduct?.product?.brand ??
          selectedCartItem[brandName]?.[0]?.productClassification?.product
            ?.brand;
        const brandId = brand?.id ?? "";
        const shopVoucherId = chosenBrandVouchers[brandId]?.id ?? "";

        return {
          shopVoucherId,
          message: values?.orders[index]?.message ?? "",
          items,
        };
      })
    : [];
  return orders;
};
