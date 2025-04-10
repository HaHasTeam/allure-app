import { StyleSheet, Text, View } from "react-native";
import React, { Dispatch, SetStateAction, useRef, useState } from "react";
import { FloatingButton, FloatingButtonLayouts } from "react-native-ui-lib";
import { myTheme } from "@/constants";
import { useTranslation } from "react-i18next";
import { hexToRgba } from "@/utils/color";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getMyCartApi, removeMultipleCartItemApi } from "@/hooks/api/cart";
import { useToast } from "@/contexts/ToastContext";
import useHandleServerError from "@/hooks/useHandleServerError";
import Confirmation from "../confirmation/Confirmation";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

interface CartAdditionalProps {
  selectedCartItems: string[];
  setSelectedCartItems: Dispatch<SetStateAction<string[]>>;
}
const CartAdditional = ({
  selectedCartItems,
  setSelectedCartItems,
}: CartAdditionalProps) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const handleServerError = useHandleServerError();
  const [
    openConfirmDeleteMultipleCartDialog,
    setOpenConfirmDeleteMultipleCartDialog,
  ] = useState(false);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const toggleModalVisibility = () => {
    if (openConfirmDeleteMultipleCartDialog) {
      bottomSheetModalRef.current?.close(); // Close modal if it's visible
    } else {
      bottomSheetModalRef.current?.present(); // Open modal if it's not visible
    }
    setOpenConfirmDeleteMultipleCartDialog(
      !openConfirmDeleteMultipleCartDialog
    ); // Toggle the state
  };

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
      <View style={styles.floatingButtonContainer}>
        <FloatingButton
          visible={selectedCartItems && selectedCartItems?.length > 0}
          fullWidth={false}
          secondaryButton={{
            label: t("cart.clearAll"),
            onPress: () => {
              setSelectedCartItems([]);
            },
            outline: true,
            color: myTheme.gray[600],
            outlineColor: myTheme.gray[500],
            size: "large",
          }}
          button={{
            label: t("cart.delete"),
            onPress: () => {
              toggleModalVisibility();
            },
            backgroundColor: myTheme.destructive,
            size: "large",
          }}
          buttonLayout={FloatingButtonLayouts.HORIZONTAL}
          bottomMargin={0}
          // hideBackgroundOverlay
          withoutAnimation
          duration={200}
        />
      </View>
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
        bottomSheetModalRef={bottomSheetModalRef}
        setIsModalVisible={setOpenConfirmDeleteMultipleCartDialog}
        toggleModalVisibility={toggleModalVisibility}
      />
    </>
  );
};

export default CartAdditional;

const styles = StyleSheet.create({
  floatingButtonContainer: {
    position: "absolute",
    bottom: 0,
    zIndex: 1,
    width: "100%",
    backgroundColor: hexToRgba(myTheme.white, 0.6),
  },
});
