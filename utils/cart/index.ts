import { ICartByBrand, ICartItem } from "@/types/cart";
import { IClassification } from "@/types/classification";
import { ProductDiscountEnum, StatusEnum } from "@/types/enum";
import { IPreOrder, PreOrderProductEnum } from "@/types/pre-order";
import { IProduct } from "@/types/product";
import { IProductDiscount } from "@/types/product-discount";

export const createCheckoutItem = (
  cartItems: ICartItem[],
  selectedCartItems: string[]
) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  if (selectedCartItems?.length > 0) {
    const filteredItems = cartItems?.filter((cart) =>
      selectedCartItems?.includes(cart?.id)
    );
    if (filteredItems?.length > 0) {
      return filteredItems.map((item) => ({
        classificationId: item?.productClassification?.id || "",
        quantity: item?.quantity || 0,
      }));
    }
  }
  return cartItems?.map((item) => ({
    classificationId: item?.productClassification?.id || "",
    quantity: item?.quantity || 0,
  }));
};

export const createCheckoutItems = (
  cartData: ICartByBrand,
  selectedCartItems: string[]
) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return Object.entries(cartData).map(([_brandName, cartItems]) => ({
    brandId:
      cartItems[0]?.productClassification?.productDiscount?.product?.brand
        ?.id ??
      cartItems[0]?.productClassification?.preOrderProduct?.product?.brand
        ?.id ??
      cartItems[0]?.productClassification?.product?.brand?.id ??
      "",
    brandItems: createCheckoutItem(cartItems, selectedCartItems),
  }));
};

export const createCartFromProduct = (
  product: IProduct,
  quantity: number,
  productClassification: IClassification
): ICartByBrand => {
  const brandName = product?.brand?.name ?? "";
  const currentTime = new Date();
  const preOrderProduct: IPreOrder | null =
    product?.preOrderProducts?.find((item) => {
      const startTime = new Date(item.startTime);
      const endTime = new Date(item.endTime);

      return (
        currentTime >= startTime &&
        currentTime <= endTime &&
        item.status === PreOrderProductEnum.ACTIVE
      );
    }) ?? null;
  const productDiscount: IProductDiscount | null =
    product?.productDiscounts?.find((item) => {
      const startTime = new Date(item.startTime);
      const endTime = new Date(item.endTime);

      return (
        currentTime >= startTime &&
        currentTime <= endTime &&
        item.status === ProductDiscountEnum.ACTIVE
      );
    }) ?? null;
  const cartItems: ICartItem = {
    id: product?.id,
    quantity: quantity,
    classification: productClassification?.title,
    status: StatusEnum.ACTIVE,
    productClassification: {
      ...productClassification,
      preOrderProduct: preOrderProduct
        ? {
            ...preOrderProduct,
            product: product?.id
              ? { ...product, brand: product?.brand }
              : ({} as IProduct),
          }
        : null,
      productDiscount: productDiscount
        ? {
            ...productDiscount,
            product: product?.id
              ? { ...product, brand: product?.brand }
              : ({} as IProduct),
          }
        : null,
      product: {
        ...product,
        brand: product?.brand,
        productDiscounts: productDiscount ? [productDiscount] : [],
      },
    },
  };

  return {
    [brandName]: [cartItems],
  };
};
