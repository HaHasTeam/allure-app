import React, { ReactElement } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
// import { Popover } from 'react-native-popover-view';
import { myTheme } from "@/constants";

interface TotalPriceDetailProps {
  totalProductDiscount: number;
  totalBrandDiscount: number;
  totalPlatformDiscount: number;
  totalPayment: number;
  totalSavings: number;
  totalProductCost: number;
}

const TotalPriceDetail = ({
  totalBrandDiscount,
  totalPayment,
  totalPlatformDiscount,
  totalProductDiscount,
  totalSavings,
  totalProductCost,
}: TotalPriceDetailProps) => {
  const { t } = useTranslation();

  return (
    // <Popover
    //   from={triggerComponent}
    //   popoverStyle={styles.popover}
    // >
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
    // </Popover>
  );
};

const styles = StyleSheet.create({
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
    marginVertical: 8,
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
