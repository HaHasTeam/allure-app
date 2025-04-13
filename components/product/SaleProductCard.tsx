import React, { useMemo } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { Link } from "expo-router";
import { Card } from "react-native-ui-lib";
import { AntDesign } from "@expo/vector-icons";
import ProductTag from "./ProductTag";
import { myTheme } from "@/constants";
import { getCheapestClassification } from "@/utils/product";
import { DiscountTypeEnum, OrderEnum, StatusEnum } from "@/types/enum";
import { calculateDiscountPrice } from "@/utils/price";
import { TFlashSale } from "@/types/flash-sale";
import SoldProgress from "../sold-progress";
import ImageWithFallback from "../image/ImageWithFallBack";

interface SaleProductCardProps {
  product: TFlashSale;
}
function SaleProductCard({ product }: SaleProductCardProps) {
  const { t } = useTranslation();
  const cheapestClassification = useMemo(
    () => getCheapestClassification(product.productClassifications ?? []),
    [product.productClassifications]
  );

  return (
    <Link href={`/(products)/product-detail/${product.product.id}`}>
      <Card style={styles.card}>
        <View style={styles.imageContainer}>
          <View style={styles.tagContainer}>
            <ProductTag tag={OrderEnum.FLASH_SALE} />
          </View>
          <ImageWithFallback
            source={{
              uri: cheapestClassification?.images?.find(
                (img) => img.status === StatusEnum.ACTIVE
              )?.fileUrl,
            }}
            style={styles.image}
            // resizeMode="cover"
          />
        </View>
        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <View style={styles.priceDetails}>
              <Text style={styles.currentPrice}>
                {t("productCard.currentPrice", {
                  price: calculateDiscountPrice(
                    cheapestClassification?.price ?? 0,
                    product.discount,
                    DiscountTypeEnum.PERCENTAGE
                  ),
                })}
              </Text>
              {product?.discount && product?.discount > 0 && (
                <Text style={styles.originalPrice}>
                  {t("productCard.price", {
                    price: cheapestClassification?.price ?? 0,
                  })}
                </Text>
              )}
            </View>
            {product?.discount && product?.discount > 0 && (
              <ProductTag
                tag="DealPercent"
                text={`-${(product.discount * 100).toFixed(0)}%`}
              />
            )}
          </View>
          <SoldProgress soldAmount={0} maxAmount={0} />
          {/* <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>{t("button.addToCard")}</Text>
          </TouchableOpacity> */}
        </View>
      </Card>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    elevation: 3,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: myTheme.white,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 1,
  },
  tagContainer: {
    position: "absolute",
    top: 12,
    left: 12,
    zIndex: 10,
  },

  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  footer: {
    padding: 12,
    gap: 8,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceDetails: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  currentPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: myTheme.primary,
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: "line-through",
    color: myTheme.mutedForeground,
  },
  button: {
    width: "100%",
    backgroundColor: myTheme.primary,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  buttonText: {
    color: myTheme.primaryForeground,
    fontWeight: "bold",
  },
});

export default SaleProductCard;
