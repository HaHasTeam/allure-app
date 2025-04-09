import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { useTranslation } from "react-i18next";

import { IClassification } from "@/types/classification";
import { ClassificationTypeEnum, DiscountTypeEnum } from "@/types/enum";
import { DiscountType } from "@/types/product-discount";
import { calculateDiscountPrice, calculateTotalPrice } from "@/utils/price";

import ProductTag from "./ProductTag";
import { myTheme } from "@/constants";
import ImageWithFallback from "../image/ImageWithFallBack";
import { useRouter } from "expo-router";

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
  const router = useRouter();
  const totalPrice = calculateTotalPrice(
    price,
    productQuantity,
    discount,
    discountType
  );
  const discountPrice = calculateDiscountPrice(price, discount, discountType);
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity
          onPress={() => router.push(`/(products)/product-detail/${productId}`)}
        >
          <View style={styles.imageContainer}>
            <ImageWithFallback
              src={productImage}
              alt={productName}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        </TouchableOpacity>

        <View style={styles.detailsContainer}>
          <View style={styles.productInfo}>
            <TouchableOpacity
              onPress={() => router.push(`/products/${productId}`)}
            >
              <Text style={styles.productName} numberOfLines={2}>
                {productName}
              </Text>
            </TouchableOpacity>
            <View>
              {eventType ? <ProductTag tag={eventType} size="small" /> : null}
            </View>
          </View>
          {productClassification?.type === ClassificationTypeEnum.CUSTOM && (
            <View style={styles.classificationContainer}>
              <Text style={styles.classificationLabel}>
                {t("productDetail.classification")}:
              </Text>
              <Text style={styles.classificationValue} numberOfLines={3}>
                {selectedClassification}
              </Text>
            </View>
          )}

          {discount &&
          discount > 0 &&
          (discountType === DiscountTypeEnum.AMOUNT ||
            discountType === DiscountTypeEnum.PERCENTAGE) ? (
            <View style={styles.priceContainer}>
              <Text style={styles.discountPrice}>
                {t("productCard.currentPrice", { price: discountPrice })}
              </Text>
              <Text style={styles.originalPrice}>
                {t("productCard.price", { price })}
              </Text>
            </View>
          ) : (
            <View style={styles.priceContainer}>
              <Text style={styles.regularPrice}>
                {t("productCard.price", { price })}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.lastItem}>
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityText}>x{productQuantity}</Text>
          </View>
          <Text style={styles.totalPrice}>
            {t("productCard.currentPrice", { price: totalPrice })}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  lastItem: {
    alignItems: "flex-end",
  },
  container: {
    width: "100%",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: myTheme.gray[200],
    flexDirection: "row",
  },
  row: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    width: "100%",
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 6,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 6,
  },
  detailsContainer: {
    flex: 1,
    flexDirection: "column",
    gap: 6,
  },
  productInfo: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 6,
  },
  productName: {
    fontSize: 14,
    fontWeight: "bold",
    flexWrap: "wrap",
    width: "100%",
  },
  classificationContainer: {
    flexDirection: "column",
    gap: 6,
  },
  classificationLabel: {
    fontSize: 12,
    color: myTheme.mutedForeground,
  },
  classificationValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: myTheme.primary,
    width: "100%",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  discountPrice: {
    fontSize: 14,
    color: myTheme.red[500],
    fontWeight: "bold",
  },
  originalPrice: {
    fontSize: 14,
    color: myTheme.gray[400],
    textDecorationLine: "line-through",
  },
  regularPrice: {
    fontSize: 14,
  },
  quantityContainer: {
    alignItems: "center",
  },
  quantityText: {
    fontSize: 14,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: myTheme.red[500],
    textAlign: "center",
  },
});

export default ProductCheckoutLandscape;
