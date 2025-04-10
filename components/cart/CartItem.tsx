import { StyleSheet, Text, View } from "react-native";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Empty from "../empty";
import BrandSection from "../brand/BrandSection";
import { IBrand } from "@/types/brand";
import { ICartItem } from "@/types/cart";
import { IBrandBestVoucher, ICheckoutItem, TVoucher } from "@/types/voucher";
import { useTranslation } from "react-i18next";
import { calculateBrandVoucherDiscount } from "@/utils/price";
import { IClassification } from "@/types/classification";
import {
  ClassificationTypeEnum,
  DiscountTypeEnum,
  OrderEnum,
  ProductDiscountEnum,
  StatusEnum,
} from "@/types/enum";
import { PreOrderProductEnum } from "@/types/pre-order";
import ProductCardLandscape from "../product/ProductCardLandspace";
import { AntDesign } from "@expo/vector-icons";
import VoucherBrandList from "../voucher/VoucherBrandList";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { myTheme } from "@/constants";

interface CartItemProps {
  brandName: string;
  cartBrandItem: ICartItem[];
  selectedCartItems: string[];
  onSelectBrand: (productIds: string[], isSelected: boolean) => void;
  bestVoucherForBrand: IBrandBestVoucher;
  onVoucherSelect: (brandId: string, voucher: TVoucher | null) => void;
  brand?: IBrand;
  checkoutItems: ICheckoutItem[];
  selectedCheckoutItems: ICheckoutItem[];
  isTriggerTotal: boolean;
  setIsTriggerTotal: Dispatch<SetStateAction<boolean>>;
}
const CartItem = ({
  brandName,
  cartBrandItem,
  selectedCartItems,
  onSelectBrand,
  bestVoucherForBrand,
  onVoucherSelect,
  brand,
  checkoutItems,
  selectedCheckoutItems,
  setIsTriggerTotal,
  isTriggerTotal,
}: CartItemProps) => {
  const { t } = useTranslation();
  const [chosenVoucher, setChosenVoucher] = useState<TVoucher | null>(null);
  const [openVoucherList, setOpenVoucherList] = useState(false);

  const bottomSheetVoucherModalRef = useRef<BottomSheetModal>(null);
  const toggleVoucherVisibility = () => {
    if (openVoucherList) {
      bottomSheetVoucherModalRef.current?.close(); // Close modal if it's visible
    } else {
      bottomSheetVoucherModalRef.current?.present(); // Open modal if it's not visible
    }
    setOpenVoucherList(!openVoucherList); // Toggle the state
  };

  const cartItemIds = cartBrandItem?.map((cartItem) => cartItem.id);
  const isBrandSelected = cartBrandItem.every((productClassification) =>
    selectedCartItems?.includes(productClassification.id)
  );
  const hasBrandProductSelected = cartBrandItem.some((productClassification) =>
    selectedCartItems?.includes(productClassification.id)
  );

  // Handler for brand-level checkbox
  const handleBrandSelect = () => {
    onSelectBrand(cartItemIds, !isBrandSelected);
  };

  // Handler for individual product selection
  const handleSelectCartItem = (cartItemId: string, isSelected: boolean) => {
    onSelectBrand([cartItemId], isSelected);
  };
  const handleVoucherChange = (voucher: TVoucher | null) => {
    setChosenVoucher(voucher);
    onVoucherSelect(brand?.id ?? "", voucher);
  };
  const voucherDiscount = useMemo(
    () =>
      calculateBrandVoucherDiscount(
        cartBrandItem,
        selectedCartItems,
        chosenVoucher
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cartBrandItem, selectedCartItems, chosenVoucher, isTriggerTotal]
  );
  useEffect(() => {
    if (selectedCartItems.length === 0 || voucherDiscount === 0) {
      setChosenVoucher(null);
    }
  }, [selectedCartItems, voucherDiscount]);

  return (
    <View style={styles.cartItemContainer}>
      {/* Brand section */}
      {brand && (
        <BrandSection
          brandId={brand.id}
          brandName={brand.name}
          isBrandSelected={isBrandSelected}
          handleBrandSelect={handleBrandSelect}
          brandLogo={brand.logo}
        />
      )}
      {/* Product Cards */}
      {cartBrandItem?.map((cartItem: ICartItem) => {
        const product =
          cartItem?.productClassification?.preOrderProduct?.product ??
          cartItem?.productClassification?.productDiscount?.product ??
          cartItem?.productClassification?.product;

        const productClassification = cartItem?.productClassification ?? null;
        const allProductClassifications: IClassification[] =
          productClassification?.preOrderProduct?.productClassifications ??
          productClassification?.productDiscount?.productClassifications ??
          productClassification?.product?.productClassifications ??
          [];
        const productClassificationQuantity =
          cartItem?.productClassification?.quantity ?? 0;
        // const productImage = cartItem?.productClassification?.images?.[0]?.fileUrl ?? ''
        const productImage =
          (cartItem?.productClassification?.type ===
          ClassificationTypeEnum.DEFAULT
            ? product?.images?.filter(
                (img) => img?.status === StatusEnum.ACTIVE
              )[0]?.fileUrl
            : cartItem?.productClassification?.images?.filter(
                (img) => img?.status === StatusEnum.ACTIVE
              )[0]?.fileUrl) ?? "";
        const productName = product?.name ?? "";
        const productId = product?.id ?? "";
        const productPrice = cartItem?.productClassification?.price ?? 0;
        const productQuantity = cartItem?.quantity ?? 0;
        // const selectedClassification = cartItem?.classification ?? ''

        const eventType =
          cartItem?.productClassification?.preOrderProduct &&
          cartItem?.productClassification?.preOrderProduct?.status ===
            PreOrderProductEnum.ACTIVE
            ? OrderEnum.PRE_ORDER
            : cartItem?.productClassification?.productDiscount &&
              cartItem?.productClassification?.productDiscount?.status ===
                ProductDiscountEnum.ACTIVE
            ? OrderEnum.FLASH_SALE
            : "";
        const discount =
          eventType === OrderEnum.FLASH_SALE
            ? cartItem?.productClassification?.productDiscount?.discount
            : null;

        const discountType =
          eventType === OrderEnum.FLASH_SALE
            ? DiscountTypeEnum.PERCENTAGE
            : null;
        const productStatus = product.status;

        return (
          <ProductCardLandscape
            key={cartItem?.id}
            cartItem={cartItem}
            productImage={productImage}
            productId={productId}
            productName={productName}
            classifications={allProductClassifications}
            productClassification={productClassification}
            discount={discount}
            discountType={discountType}
            price={productPrice}
            cartItemId={cartItem?.id}
            eventType={eventType}
            isSelected={selectedCartItems?.includes(cartItem?.id)}
            onChooseProduct={() =>
              handleSelectCartItem(
                cartItem?.id,
                !selectedCartItems?.includes(cartItem?.id)
              )
            }
            productQuantity={productQuantity}
            productClassificationQuantity={productClassificationQuantity}
            setIsTriggerTotal={setIsTriggerTotal}
            productStatus={productStatus}
          />
        );
      })}

      {/* Voucher */}
      <View style={styles.voucherContainer}>
        <AntDesign name="tags" size={20} color="red" />
        <Text>
          {chosenVoucher && hasBrandProductSelected
            ? chosenVoucher?.discountType === DiscountTypeEnum.AMOUNT
              ? t("voucher.discountAmount", { amount: voucherDiscount })
              : t("voucher.discountAmount", { amount: voucherDiscount })
            : bestVoucherForBrand?.bestVoucher
            ? bestVoucherForBrand?.bestVoucher?.discountType ===
                DiscountTypeEnum.AMOUNT &&
              bestVoucherForBrand?.bestVoucher?.discountValue
              ? t("voucher.bestDiscountAmountDisplay", {
                  amount: bestVoucherForBrand?.bestVoucher?.discountValue,
                })
              : t("voucher.bestDiscountPercentageDisplay", {
                  percentage:
                    bestVoucherForBrand?.bestVoucher?.discountValue * 100,
                })
            : null}
        </Text>

        <VoucherBrandList
          triggerText={
            chosenVoucher
              ? t("cart.viewMoreVoucher")
              : t("voucher.chooseVoucher")
          }
          brandName={brand?.name ?? ""}
          brandId={brand?.id ?? ""}
          brandLogo={brand?.logo ?? ""}
          hasBrandProductSelected={hasBrandProductSelected}
          handleVoucherChange={handleVoucherChange}
          checkoutItems={checkoutItems}
          selectedCheckoutItems={selectedCheckoutItems}
          bestVoucherForBrand={bestVoucherForBrand}
          chosenBrandVoucher={chosenVoucher}
          voucherDiscount={voucherDiscount}
          bottomSheetModalRef={bottomSheetVoucherModalRef}
          setIsModalVisible={setOpenVoucherList}
          toggleModalVisibility={toggleVoucherVisibility}
        />
      </View>
    </View>
  );
};

export default CartItem;

const styles = StyleSheet.create({
  cartItemContainer: {
    paddingHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: myTheme.white,
    marginHorizontal: 5,
    marginBottom: 10,
  },
  voucherContainer: {
    flexDirection: "row",
    gap: 3,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});
