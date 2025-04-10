import React, {
  Dispatch,
  ReactElement,
  SetStateAction,
  useCallback,
  useMemo,
} from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
// import { Popover } from 'react-native-popover-view';
import { myTheme } from "@/constants";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
  TouchableWithoutFeedback,
} from "@gorhom/bottom-sheet";

interface TotalPriceDetailProps {
  totalProductDiscount: number;
  totalBrandDiscount: number;
  totalPlatformDiscount: number;
  totalPayment: number;
  totalSavings: number;
  totalProductCost: number;
  setIsModalVisible: Dispatch<SetStateAction<boolean>>;
  toggleModalVisibility: () => void;
  bottomSheetModalRef: React.RefObject<BottomSheetModal>;
}

const TotalPriceDetail = ({
  totalBrandDiscount,
  totalPayment,
  totalPlatformDiscount,
  totalProductDiscount,
  totalSavings,
  totalProductCost,
  setIsModalVisible,
  toggleModalVisibility,
  bottomSheetModalRef,
}: TotalPriceDetailProps) => {
  const { t } = useTranslation();

  const snapPoints = useMemo(() => ["30%", "50%", "60%", "100%"], []);
  const renderBackdrop = React.useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        opacity={0.9}
        onPress={() => bottomSheetModalRef.current?.close()}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    []
  );

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);
  const handleModalDismiss = () => {
    bottomSheetModalRef.current?.close();
    setIsModalVisible(false);
  };

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      onDismiss={handleModalDismiss}
      backdropComponent={renderBackdrop}
    >
      <TouchableWithoutFeedback onPress={handleModalDismiss}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      <BottomSheetView style={styles.contentContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>{t("cart.discountDetails")}</Text>
          <View style={styles.detailsContainer}>
            <View style={styles.row}>
              <Text style={styles.label}>{t("cart.totalCost")}</Text>
              <Text style={styles.value}>
                {t("productCard.price", { price: totalProductCost })}
              </Text>
            </View>

            {totalProductDiscount && totalProductDiscount > 0 ? (
              <View style={styles.row}>
                <Text style={styles.label}>{t("cart.directDiscount")}</Text>
                <Text style={styles.discountValue}>
                  -{t("productCard.price", { price: totalProductDiscount })}
                </Text>
              </View>
            ) : null}

            {totalBrandDiscount && totalBrandDiscount > 0 ? (
              <View style={styles.row}>
                <Text style={styles.label}>{t("cart.discountBrand")}</Text>
                <Text style={styles.discountValue}>
                  -{t("productCard.price", { price: totalBrandDiscount })}
                </Text>
              </View>
            ) : null}

            {totalPlatformDiscount && totalPlatformDiscount > 0 ? (
              <View style={styles.row}>
                <Text style={styles.label}>{t("cart.discountPlatform")}</Text>
                <Text style={styles.discountValue}>
                  -{t("productCard.price", { price: totalPlatformDiscount })}
                </Text>
              </View>
            ) : null}

            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.totalLabel}>{t("cart.totalPayment")}</Text>
              <Text style={styles.totalValue}>
                {t("productCard.price", { price: totalPayment })}
              </Text>
            </View>

            {totalSavings && totalSavings > 0 ? (
              <View style={styles.row}>
                <Text style={styles.label}>{t("cart.savings")}</Text>
                <Text style={styles.discountValue}>
                  -{t("productCard.price", { price: totalSavings })}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    zIndex: 1,
  },
  popover: {
    width: 300,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 0,
  },
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
  },
  detailsContainer: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontWeight: "500",
  },
  discountValue: {
    fontSize: 14,
    fontWeight: "500",
    color: myTheme.green[700],
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: myTheme.gray[200],
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "500",
    color: myTheme.red[500],
  },
});

export default TotalPriceDetail;
