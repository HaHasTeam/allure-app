import React, {
  Dispatch,
  SetStateAction,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import {
  Checkbox,
  FloatingButton,
  FloatingButtonLayouts,
} from "react-native-ui-lib";
import { Feather } from "@expo/vector-icons";
import { myTheme } from "@/constants";
import { hexToRgba } from "@/utils/color";
import {
  getMyCartApi,
  removeAllCartItemApi,
  removeMultipleCartItemApi,
} from "@/hooks/api/cart";
import useHandleServerError from "@/hooks/useHandleServerError";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ICartByBrand } from "@/types/cart";
import Confirmation from "../confirmation/Confirmation";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useToast } from "@/contexts/ToastContext";

interface CartHeaderProps {
  cartItemCountAll: number;
  onCheckAll?: () => void;
  isAllSelected?: boolean;
  isShowCheckbox?: boolean;
  totalCartItems: number;
  cartItemCount: number;
  setSelectedCartItems: Dispatch<SetStateAction<string[]>>;
  selectedCartItems: string[];
  cartByBrand: ICartByBrand;
}

export default function CartHeader({
  isShowCheckbox = true,
  totalCartItems,
  cartItemCount,
  onCheckAll,
  isAllSelected,
  selectedCartItems,
  cartByBrand,
  cartItemCountAll,
  setSelectedCartItems,
}: CartHeaderProps) {
  const { t } = useTranslation();
  const handleServerError = useHandleServerError();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [openConfirmDeleteAllCartDialog, setOpenConfirmDeleteAllCartDialog] =
    useState(false);
  const [
    openConfirmDeleteMultipleCartDialog,
    setOpenConfirmDeleteMultipleCartDialog,
  ] = useState(false);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const toggleModalVisibility = () => {
    if (openConfirmDeleteAllCartDialog) {
      bottomSheetModalRef.current?.close(); // Close modal if it's visible
    } else {
      bottomSheetModalRef.current?.present(); // Open modal if it's not visible
    }
    setOpenConfirmDeleteAllCartDialog(!openConfirmDeleteAllCartDialog); // Toggle the state
  };
  const bottomSheetModalMultiRef = useRef<BottomSheetModal>(null);
  const toggleModalMultiVisibility = () => {
    if (openConfirmDeleteMultipleCartDialog) {
      bottomSheetModalMultiRef.current?.close(); // Close modal if it's visible
    } else {
      bottomSheetModalMultiRef.current?.present(); // Open modal if it's not visible
    }
    setOpenConfirmDeleteMultipleCartDialog(
      !openConfirmDeleteMultipleCartDialog
    ); // Toggle the state
  };
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
      showToast(
        t("delete.cart.success", { amount: t("delete.cart.All") }),
        "success",
        4000
      ),
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
  const { mutateAsync: removeMultipleCartItemFn } = useMutation({
    mutationKey: [removeMultipleCartItemApi.mutationKey],
    mutationFn: removeMultipleCartItemApi.fn,
    onSuccess: () => {
      showToast(
        t("delete.cart.success", {
          amount: selectedCartItems?.length,
        }),
        "success",
        4000
      );
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

  return (
    <>
      <View style={styles.container}>
        <View style={styles.innerContainer}>
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.selectAllContainer}
              onPress={onCheckAll}
            >
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
            </TouchableOpacity>
          </View>
          {/* <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.commonButton}
              onPress={() => toggleModalVisibility()}
            >
              <Feather name="trash-2" size={24} color={myTheme.red[500]} />
              <Text style={styles.buttonText}>{t("cart.removeAll")}</Text>
            </TouchableOpacity>
          </View> */}

          {selectedCartItems && selectedCartItems?.length > 0 && (
            <View style={styles.moreAction}>
              <TouchableOpacity
                style={styles.clearAllContainer}
                onPress={() => setSelectedCartItems([])}
              >
                <Feather name="x-circle" size={16} color={myTheme.gray[400]} />
                <Text style={styles.resetText}>{t("filter.reset")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => toggleModalMultiVisibility()}
              >
                <Feather name="trash-2" size={16} color="red" />
                <Text style={styles.deleteText}>{t("cart.remove")}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      {/* <Confirmation
        action="delete"
        item="cart"
        title={t("delete.cart.title", { amount: t("delete.cart.all") })}
        description={t("delete.cart.description", {
          amount: t("delete.cart.all"),
        })}
        onConfirm={() => {
          // Handle delete multiple confirmation
          handleRemoveAllCartItem();
          setOpenConfirmDeleteAllCartDialog(false);
        }}
        bottomSheetModalRef={bottomSheetModalRef}
        setIsModalVisible={setOpenConfirmDeleteAllCartDialog}
        toggleModalVisibility={toggleModalVisibility}
      /> */}
      <Confirmation
        action="delete"
        item="cart"
        title={t("delete.cart.title", { amount: selectedCartItems?.length })}
        description={t("delete.cart.description", {
          amount: selectedCartItems?.length,
        })}
        onConfirm={() => {
          // Handle delete multiple confirmation
          handleRemoveMultipleCartItem();
          setOpenConfirmDeleteMultipleCartDialog(false);
        }}
        bottomSheetModalRef={bottomSheetModalMultiRef}
        setIsModalVisible={setOpenConfirmDeleteMultipleCartDialog}
        toggleModalVisibility={toggleModalMultiVisibility}
      />
    </>
  );
}

const styles = StyleSheet.create({
  deleteButton: {
    backgroundColor: myTheme.red[100],
    borderRadius: 30,
    paddingVertical: 4,
    paddingHorizontal: 10,
    flexDirection: "row",
    gap: 2,
    alignItems: "center",
  },
  deleteText: { color: myTheme.red[500] },

  moreAction: {
    flexDirection: "row",
    gap: 2,
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 2,
  },
  clearAllContainer: {
    flexDirection: "row",
    gap: 2,
    alignItems: "center",
    backgroundColor: myTheme.gray[200],
    borderRadius: 30,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  selectAllContainer: {
    flexDirection: "row",
    gap: 2,
    alignItems: "center",
  },
  checkbox: {
    alignSelf: "center",
    borderRadius: 6,
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
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: hexToRgba(myTheme.primary, 0.2),
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: myTheme.secondaryForeground,
  },
  resetText: {
    color: myTheme.gray[500],
  },
  buttonGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  commonButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 4,
    gap: 8,
  },
  buttonText: {
    color: myTheme.black,
    fontSize: 14,
  },
  rightSection: {
    width: "100%",
    paddingTop: 4,
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
  icon: { color: myTheme.primary },
  container: {
    width: "100%",
    backgroundColor: hexToRgba(myTheme.secondary, 0.3),
    borderRadius: 6,
    marginHorizontal: 5,
    marginTop: 5,
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  innerContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  productLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "space-between",
    width: "73%",
  },
  productLabelInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  labelText: {
    fontWeight: "500",
    fontSize: 14,
    color: myTheme.secondaryForeground,
  },
  quantityContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "17%",
    color: myTheme.secondaryForeground,
  },
  totalContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  trashContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: "10%",
  },
  text: {
    fontWeight: "500",
    fontSize: 14,
    color: myTheme.secondaryForeground,
  },
});
