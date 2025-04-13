import { useTranslation } from "react-i18next";

import { IClassification } from "@/types/classification";
import { ClassificationTypeEnum, OrderEnum, StatusEnum } from "@/types/enum";
import { IOrderDetail } from "@/types/order";
import { IProduct } from "@/types/product";

import ProductTag from "../product/ProductTag";
import ImageWithFallback from "../image/ImageWithFallBack";
import { myTheme } from "@/constants";
import { StyleSheet, Text } from "react-native";
import { View } from "react-native";

interface ProductOrderLandscapeProps {
  product: IProduct;
  productClassification: IClassification;
  orderDetail: IOrderDetail;
  productType: string | null;
}
const ProductOrderLandscape = ({
  product,
  productClassification,
  orderDetail,
  productType,
}: ProductOrderLandscapeProps) => {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <ImageWithFallback
          src={
            productClassification?.type === "DEFAULT"
              ? product?.images?.filter((img) => img?.status === "ACTIVE")[0]
                  ?.fileUrl
              : productClassification?.images?.filter(
                  (img) => img?.status === "ACTIVE"
                )[0]?.fileUrl ?? ""
          }
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.productName} numberOfLines={2}>
          {product?.name}
        </Text>
        {productClassification?.type === "CUSTOM" && (
          <Text style={styles.classificationText}>
            {t("order.classification")}:{" "}
            <Text style={styles.classificationTitle}>
              {productClassification?.title}
            </Text>
          </Text>
        )}
        <Text style={styles.quantity}>x{orderDetail?.quantity}</Text>
        {productType && productType !== "NORMAL" && (
          <View style={styles.productTagContainer}>
            <ProductTag tag={productType} />
          </View>
        )}
      </View>
      <View style={styles.priceContainer}>
        {orderDetail?.unitPriceBeforeDiscount -
          orderDetail?.unitPriceAfterDiscount ===
        0 ? null : (
          <Text style={styles.priceBeforeDiscount}>
            {t("productCard.price", { price: productClassification?.price })}
          </Text>
        )}
        {orderDetail?.unitPriceBeforeDiscount -
          orderDetail?.unitPriceAfterDiscount ===
        0 ? (
          <Text style={styles.priceFinal}>
            {t("productCard.price", {
              price: productClassification?.price,
            })}
          </Text>
        ) : (
          <Text style={styles.priceFinal}>
            {t("productCard.price", {
              price: orderDetail?.unitPriceAfterDiscount,
            })}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  productTagContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 4,
  },
  container: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  imageContainer: {
    width: 40,
    height: 40,
    alignSelf: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  contentContainer: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    textOverflow: "ellipsis",
  },
  classificationText: {
    fontSize: 14,
    color: myTheme.mutedForeground,
  },
  classificationTitle: {
    color: myTheme.primary,
    fontWeight: "500",
  },
  quantity: {
    fontSize: 14,
  },
  priceContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 4,
  },
  priceBeforeDiscount: {
    fontSize: 14,
    color: myTheme.mutedForeground,
    textDecorationLine: "line-through",
  },
  priceFinal: {
    fontSize: 14,
    color: myTheme.red[500],
  },
});
export default ProductOrderLandscape;
