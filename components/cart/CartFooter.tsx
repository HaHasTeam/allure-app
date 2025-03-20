import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ICartByBrand } from "@/types/cart";
import { DiscountTypeEnum, ProjectInformationEnum } from "@/types/enum";
import { IPlatformBestVoucher, TVoucher } from "@/types/voucher";
import useHandleServerError from "@/hooks/useHandleServerError";
import { Feather } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity, Text } from "react-native";
import TotalPriceDetail from "./TotalPriceDetail";
import { myTheme } from "@/constants";
import { Checkbox, View } from "react-native-ui-lib";
import {
  getMyCartApi,
  removeAllCartItemApi,
  removeMultipleCartItemApi,
} from "@/hooks/api/cart";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "expo-router";

interface CartFooterProps {
  cartItemCountAll: number;
  cartItemCount: number;
  onCheckAll: () => void;
  isAllSelected: boolean;
  selectedCartItems: string[];
  setSelectedCartItems: Dispatch<SetStateAction<string[]>>;
  totalProductDiscount: number;
  totalVoucherDiscount: number;
  totalOriginalPrice: number;
  totalFinalPrice: number;
  savedPrice: number;
  platformChosenVoucher: TVoucher | null;
  setPlatformChosenVoucher: Dispatch<SetStateAction<TVoucher | null>>;
  platformVoucherDiscount: number;
  cartByBrand: ICartByBrand;
  bestPlatformVoucher: IPlatformBestVoucher | null;
}
export default function CartFooter({
  cartItemCountAll,
  cartItemCount,
  onCheckAll,
  isAllSelected,
  totalOriginalPrice,
  selectedCartItems,
  setSelectedCartItems,
  totalProductDiscount,
  totalVoucherDiscount,
  savedPrice,
  platformChosenVoucher,
  setPlatformChosenVoucher,
  totalFinalPrice,
  platformVoucherDiscount,
  cartByBrand,
  bestPlatformVoucher,
}: CartFooterProps) {
  const { t } = useTranslation();
  const handleServerError = useHandleServerError();
  const { successToast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [openConfirmDeleteAllCartDialog, setOpenConfirmDeleteAllCartDialog] =
    useState(false);
  const [
    openConfirmDeleteMultipleCartDialog,
    setOpenConfirmDeleteMultipleCartDialog,
  ] = useState(false);
  const [openWarningDialog, setOpenWarningDialog] = useState(false);
  const insufficientStockItems = useMemo(() => {
    return Object.values(cartByBrand)
      .flat()
      .filter(
        (cartItem) =>
          selectedCartItems.includes(cartItem.id) &&
          cartItem.quantity &&
          cartItem.productClassification?.quantity !== undefined &&
          cartItem.quantity > cartItem.productClassification.quantity
      );
  }, [cartByBrand, selectedCartItems]);
  const soldOutItems = useMemo(() => {
    return Object.values(cartByBrand)
      .flat()
      .filter(
        (cartItem) =>
          selectedCartItems.includes(cartItem.id) &&
          cartItem.quantity &&
          cartItem.productClassification?.quantity !== undefined &&
          cartItem.productClassification.quantity === 0
      );
  }, [cartByBrand, selectedCartItems]);
  // handle remove cart items api starts
  const { mutateAsync: removeAllCartItemFn } = useMutation({
    mutationKey: [removeAllCartItemApi.mutationKey],
    mutationFn: removeAllCartItemApi.fn,
    onSuccess: () => {
      successToast({
        message: t("delete.cart.success", { amount: t("delete.cart.All") }),
      });
      queryClient.invalidateQueries({
        queryKey: [getMyCartApi.queryKey],
      });
    },
  });
  const { mutateAsync: removeMultipleCartItemFn } = useMutation({
    mutationKey: [removeMultipleCartItemApi.mutationKey],
    mutationFn: removeMultipleCartItemApi.fn,
    onSuccess: () => {
      successToast({
        message: t("delete.cart.success", {
          amount: selectedCartItems?.length,
        }),
      });
      setSelectedCartItems((prevSelectedCartItems) =>
        prevSelectedCartItems.filter(
          (itemId) => !selectedCartItems.includes(itemId)
        )
      );
      queryClient.invalidateQueries({
        queryKey: [getMyCartApi.queryKey],
      });
    },
  });
  // handle remove cart items api ends
  // handle remove cart items function starts
  async function handleRemoveAllCartItem() {
    try {
      await removeAllCartItemFn();
    } catch (error) {
      console.log(error);
      handleServerError({
        error,
      });
    }
  }
  async function handleRemoveMultipleCartItem() {
    try {
      if (selectedCartItems && selectedCartItems?.length > 0) {
        await removeMultipleCartItemFn({ itemIds: selectedCartItems });
      }
    } catch (error) {
      console.log(error);
      handleServerError({
        error,
      });
    }
  }
  // handle remove cart items function ends

  // handle checkout button
  const handleCheckout = () => {
    if (selectedCartItems && selectedCartItems?.length > 0) {
      if (insufficientStockItems?.length > 0 || soldOutItems?.length > 0) {
        setOpenWarningDialog(true);
      } else {
        router.push("/checkout");
      }
    } else setOpenWarningDialog(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Voucher Section */}
        <View style={styles.sectionContainer}>
          {/* Left Section */}
          <View style={styles.leftSection}>
            <View style={styles.checkboxContainer}>
              <Checkbox
                value={isAllSelected}
                onValueChange={onCheckAll}
                style={styles.checkbox}
                color={myTheme.primary}
                size={20}
              />
              <Text style={styles.checkboxLabel}>
                {t("cart.selectAll")} ({cartItemCountAll})
              </Text>
            </View>
            <View style={styles.buttonGroup}>
              {selectedCartItems && selectedCartItems?.length > 0 && (
                <TouchableOpacity
                  onPress={() => setOpenConfirmDeleteMultipleCartDialog(true)}
                >
                  <Feather name="trash-2" size={24} color="red" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.destructiveButton}
                onPress={() => setOpenConfirmDeleteAllCartDialog(true)}
              >
                <Feather name="trash-2" size={24} color="white" />
                <Text style={styles.buttonText}>
                  {t("cart.removeAll")} ({cartItemCountAll})
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Right Section */}
          <View style={styles.rightSection}>
            {/* Total Section */}
            <View style={styles.totalSection}>
              <View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>
                    {t("cart.total")} ({cartItemCount} {t("cart.products")}):
                  </Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.finalPrice}>
                      {t("productCard.price", { price: totalFinalPrice })}
                    </Text>
                    {savedPrice && savedPrice > 0 ? (
                      <TotalPriceDetail
                        totalProductDiscount={totalProductDiscount}
                        totalBrandDiscount={totalVoucherDiscount}
                        totalPlatformDiscount={platformVoucherDiscount}
                        totalPayment={totalFinalPrice}
                        totalSavings={savedPrice}
                        totalProductCost={totalOriginalPrice}
                      />
                    ) : null}
                  </View>
                </View>
                {savedPrice && savedPrice > 0 ? (
                  <View style={styles.savedContainer}>
                    <Text style={styles.savedText}>
                      {t("cart.saved")}:
                      <Text style={styles.savedAmount}>
                        {" "}
                        {t("productCard.price", { price: savedPrice })}
                      </Text>
                    </Text>
                  </View>
                ) : null}
              </View>

              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={handleCheckout}
              >
                <Text style={styles.checkoutButtonText}>{t("cart.buy")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  checkbox: {
    alignSelf: "center",
    borderRadius: 6,
  },
  container: {
    width: "100%",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    backgroundColor: "#f1f5f9",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  content: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionContainer: {
    flexDirection: "column",
  },
  leftSection: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
  },
  buttonGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  destructiveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: myTheme.destructive,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    gap: 8,
  },
  buttonText: {
    color: myTheme.white,
    fontSize: 14,
  },
  rightSection: {
    width: "100%",
  },
  totalSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  totalLabel: {
    fontSize: 16,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  finalPrice: {
    fontSize: 18,
    fontWeight: "500",
    color: myTheme.red[500],
  },
  savedContainer: {
    alignItems: "flex-end",
  },
  savedText: {
    fontSize: 14,
  },
  savedAmount: {
    fontSize: 14,
    color: myTheme.red[500],
  },
  checkoutButton: {
    backgroundColor: myTheme.primary,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
  },
  checkoutButtonText: {
    color: "white",
    fontSize: 16,
  },
});
