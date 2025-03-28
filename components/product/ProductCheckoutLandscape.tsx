import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useTranslation } from "react-i18next";

import { IClassification } from "@/types/classification";
import { ClassificationTypeEnum, DiscountTypeEnum } from "@/types/enum";
import { DiscountType } from "@/types/product-discount";
import { calculateDiscountPrice, calculateTotalPrice } from "@/utils/price";

import ProductTag from "./ProductTag";

interface ProductCheckoutLandscapeProps {
  productImage: string;
  productId: string;
  productName: string;
  selectedClassification: string;
  eventType: string;
  discountType?: DiscountType | null;
  discount?: number | null;
  price: number;
  productQuantity: number;
  productClassification: IClassification | null;
}
const ProductCheckoutLandscape = ({
  productImage,
  productId,
  productName,
  discountType,
  discount,
  eventType,
  productQuantity,
  selectedClassification,
  price,
  productClassification,
}: ProductCheckoutLandscapeProps) => {
  const { t } = useTranslation();
  const totalPrice = calculateTotalPrice(
    price,
    productQuantity,
    discount,
    discountType
  );
  const discountPrice = calculateDiscountPrice(price, discount, discountType);
  return (
    <View>
      <Text>ProductCheckoutLandscape</Text>
    </View>
  );
};

export default ProductCheckoutLandscape;

const styles = StyleSheet.create({});
