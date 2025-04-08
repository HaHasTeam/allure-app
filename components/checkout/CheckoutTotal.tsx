import { useTranslation } from "react-i18next";

import useCartStore from "@/store/cart";
import { DiscountTypeEnum } from "@/types/enum";
import { formatCurrency, formatNumber } from "@/utils/number";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { hexToRgba } from "@/utils/color";
import { myTheme } from "@/constants";
import LoadingIcon from "../loading/LoadingIcon";
import { Link } from "expo-router";
import { UseFormHandleSubmit } from "react-hook-form";
import { z } from "zod";
import { CreateOrderSchema } from "@/schema/order.schema";

interface CheckoutTotalProps {
  totalProductDiscount: number;
  totalProductCost: number;
  totalBrandDiscount: number;
  totalPlatformDiscount: number;
  totalSavings: number;
  totalPayment: number;
  isLoading: boolean;
  formId: string;
  handleSubmit: UseFormHandleSubmit<z.infer<typeof CreateOrderSchema>>;
  onSubmit: (values: z.infer<typeof CreateOrderSchema>) => void;
}
export default function CheckoutTotal({
  totalProductDiscount,
  totalProductCost,
  totalBrandDiscount,
  totalPlatformDiscount,
  totalSavings,
  isLoading,
  totalPayment,
  formId,
  handleSubmit,
  onSubmit,
}: CheckoutTotalProps) {
  const { t } = useTranslation();
  const { groupBuying, groupBuyingOrder } = useCartStore();
  const criteria = groupBuying?.groupProduct.criterias[0];
  return (
    <View style={styles.container}>
      <View style={styles.detailsContainer}>
        {/* Total Cost */}
        <View style={styles.rowBetween}>
          <Text style={styles.mutedText}>{t("cart.totalCost")}</Text>
          <Text style={styles.mediumText}>
            {t("productCard.price", { price: totalProductCost })}
          </Text>
        </View>

        {!!groupBuying && (
          <View style={styles.rowBetween}>
            <Text style={styles.mutedText}>{t("cart.wishDiscount")}</Text>
            <Text style={styles.mediumText}>
              {criteria?.voucher.discountType === DiscountTypeEnum.PERCENTAGE
                ? formatNumber(
                    String(criteria?.voucher?.discountValue ?? 0),
                    "%"
                  )
                : formatCurrency(criteria?.voucher.discountValue ?? 0)}
            </Text>
          </View>
        )}
        {totalProductDiscount && totalProductDiscount > 0 ? (
          <View style={styles.rowBetween}>
            <Text style={styles.mutedText}>{t("cart.directDiscount")}</Text>
            <Text style={styles.discountText}>
              -{t("productCard.price", { price: totalProductDiscount })}
            </Text>
          </View>
        ) : null}
        {totalBrandDiscount && totalBrandDiscount > 0 ? (
          <View style={styles.rowBetween}>
            <Text style={styles.mutedText}>{t("cart.discountBrand")}</Text>
            <Text style={styles.discountText}>
              -{t("productCard.price", { price: totalBrandDiscount })}
            </Text>
          </View>
        ) : null}
        {totalPlatformDiscount && totalPlatformDiscount > 0 ? (
          <View style={styles.rowBetween}>
            <Text style={styles.mutedText}>{t("cart.discountPlatform")}</Text>
            <Text style={styles.discountText}>
              -{t("productCard.price", { price: totalPlatformDiscount })}
            </Text>
          </View>
        ) : null}

        <View style={styles.totalPaymentContainer}>
          <Text style={styles.totalPaymentLabel}>
            {groupBuying ? t("cart.maxPrice") : t("cart.totalPayment")}
          </Text>
          <Text style={styles.totalPaymentValue}>
            {groupBuying
              ? t("productCard.price", {
                  price:
                    criteria?.voucher.discountType ===
                    DiscountTypeEnum.PERCENTAGE
                      ? (totalPayment *
                          (100 - criteria?.voucher.discountValue)) /
                        100
                      : totalPayment -
                          (criteria?.voucher?.discountValue ?? 0) <=
                        0
                      ? 0
                      : totalPayment - (criteria?.voucher?.discountValue ?? 0),
                })
              : t("productCard.price", { price: totalPayment })}
          </Text>
        </View>

        {totalSavings && totalSavings > 0 ? (
          <View style={styles.savingsContainer}>
            <Text style={styles.savingsText}>{t("cart.savings")}: </Text>
            <Text style={styles.savingsText}>
              -{t("productCard.price", { price: totalSavings })}
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.footerContainer}>
        <Text style={styles.descriptionText}>
          {t("cart.checkoutDescription")}
        </Text>
        <Text style={styles.termsText}>
          {t("cart.acceptCondition")}
          <Link href={"/"} style={styles.termsLink}>
            {t("cart.terms")}
          </Link>
        </Text>

        <TouchableOpacity
          style={[
            styles.submitButton,
            {
              backgroundColor: isLoading
                ? hexToRgba(myTheme.destructive, 0.8)
                : myTheme.destructive,
            },
          ]}
          onPress={handleSubmit(onSubmit)}
        >
          {isLoading ? (
            <LoadingIcon color="primaryBackground" />
          ) : (
            <Text style={styles.submitButtonText}>
              {groupBuying
                ? groupBuyingOrder
                  ? t("cart.updateGroupOrder")
                  : t("cart.createGroupOrder")
                : t("cart.placeOrder")}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: myTheme.white,
    borderRadius: 8,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    padding: 16,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  mutedText: {
    fontSize: 14,
    color: myTheme.mutedForeground,
  },
  mediumText: {
    fontWeight: "500",
  },
  discountText: {
    fontWeight: "500",
    color: myTheme.green[700],
  },
  totalPaymentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: myTheme.border,
  },
  totalPaymentLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  totalPaymentValue: {
    fontSize: 18,
    fontWeight: "600",
    color: myTheme.red[500],
  },
  savingsContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    marginTop: 8,
  },
  savingsText: {
    fontSize: 14,
    color: myTheme.green[700],
    fontWeight: "500",
  },
  footerContainer: {
    marginTop: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: myTheme.mutedForeground,
    textAlign: "right",
    marginBottom: 12,
  },
  termsText: {
    fontSize: 14,
    color: myTheme.mutedForeground,
    marginBottom: 8,
  },
  termsLink: {
    color: myTheme.blue[500],
    textDecorationLine: "underline",
    fontWeight: "500",
  },
  submitButton: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: myTheme.white,
    fontWeight: "600",
  },
});
