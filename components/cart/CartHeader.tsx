import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Checkbox } from "react-native-ui-lib";
import { Feather } from "@expo/vector-icons";
import { myTheme } from "@/constants";
import { hexToRgba } from "@/utils/color";

interface CartHeaderProps {
  onCheckAll?: () => void;
  isAllSelected?: boolean;
  isShowCheckbox?: boolean;
  totalCartItems: number;
}

export default function CartHeader({
  onCheckAll,
  isAllSelected,
  isShowCheckbox = true,
  totalCartItems,
}: CartHeaderProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        {/* Product Label */}
        <View style={[styles.productLabelContainer]}>
          <View style={[styles.productLabelInner]}>
            {isShowCheckbox && (
              <TouchableOpacity
                onPress={onCheckAll}
                style={styles.checkboxContainer}
              >
                <Checkbox
                  size={20}
                  value={isAllSelected}
                  onValueChange={onCheckAll}
                  style={styles.checkbox}
                  color={myTheme.primary}
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onCheckAll}>
              <Text style={styles.labelText}>
                {t("cart.Products")} ({totalCartItems} {t("cart.products")})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Product Quantity */}
        <View style={[styles.quantityContainer]}>
          <Text style={styles.text}>{t("cart.quantity")}</Text>
        </View>

        {/* Total Price
        <View style={[styles.totalContainer]}>
          <Text style={styles.text}>{t("cart.total")}</Text>
        </View> */}

        {/* Trash Icon */}
        <View style={[styles.trashContainer]}>
          <Feather name="trash-2" size={24} style={styles.icon} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  icon: { color: myTheme.primary },
  container: {
    width: "100%",
    backgroundColor: hexToRgba(myTheme.secondary, 0.3),
    borderRadius: 6,
  },
  innerContainer: {
    width: "100%",
    flexDirection: "row",
    paddingHorizontal: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  checkbox: {
    alignSelf: "center",
    borderRadius: 6,
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
  checkboxContainer: {
    marginRight: 4,
  },
  labelText: {
    fontWeight: "500",
    fontSize: 14,
    color: myTheme.secondaryForeground,
  },
  priceContainer: {
    alignItems: "center",
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
