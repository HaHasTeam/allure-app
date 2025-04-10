import React, { useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { MaterialIcons } from "@expo/vector-icons";
import { IProduct } from "@/types/product";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import ProductDetailScreen from "@/app/(app)/(products)/[id]";
import { useRouter } from "expo-router";
import ProductTag from "./ProductTag";
import { myTheme } from "@/constants";
import ProductStar from "./ProductStar";
import ImageWithFallback from "../image/ImageWithFallBack";

interface ProductCardProps {
  product: IProduct;
  isProductDiscount?: boolean;
  isInGroupBuying?: boolean;
}
const ProductCard = ({
  product,
  isProductDiscount = false,
  isInGroupBuying = false,
}: ProductCardProps) => {
  const router = useRouter();
  const { t } = useTranslation();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const toggleModalVisibility = () => {
    if (isModalVisible) {
      bottomSheetModalRef.current?.close(); // Close modal if it's visible
    } else {
      bottomSheetModalRef.current?.present(); // Open modal if it's not visible
    }
    setIsModalVisible(!isModalVisible); // Toggle the state
  };

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        onPress={() => {
          if (isInGroupBuying) {
            toggleModalVisibility();
          } else {
            router.push(`/(products)/product-detail/${product.id}`);
          }
        }}
      >
        <View style={styles.tagContainer}>
          {product?.tag && <ProductTag tag={product?.tag} />}
        </View>
        <View style={styles.imageContainer}>
          <ImageWithFallback
            src={product?.images[0]?.fileUrl}
            style={styles.image}
            resizeMode="cover"
          />
        </View>
        <View style={styles.contentContainer}>
          {isProductDiscount && product?.deal && product?.deal > 0 && (
            <ProductTag
              tag="DealPercent"
              text={`-${(product?.deal * 100).toFixed(0)}%`}
            />
          )}
          <Text numberOfLines={2} style={styles.productName}>
            {product?.name}
          </Text>
          <ProductStar
            rating={product?.rating}
            ratingAmount={product?.ratingAmount}
          />
          <Text style={styles.soldText}>
            {t("productCard.soldInPastMonth", {
              amount: product?.salesLast30Days ?? 0,
            })}
          </Text>
          <View style={styles.priceContainer}>
            {product?.deal && product?.deal > 0 ? (
              <View style={styles.priceRow}>
                <Text style={styles.currentPrice}>
                  {t("productCard.currentPrice", {
                    price: product?.currentPrice,
                  })}
                </Text>
                <Text style={styles.oldPrice}>
                  {t("productCard.price", { price: product?.price })}
                </Text>
              </View>
            ) : (
              product?.price >= 0 && (
                <Text style={styles.currentPrice}>
                  {t("productCard.price", { price: product?.price })}
                </Text>
              )
            )}
          </View>
        </View>
      </TouchableOpacity>

      <ProductDetailScreen
        initProductId={product.id ?? ""}
        isInGroupBuying
        bottomSheetModalRef={bottomSheetModalRef}
        setIsModalVisible={setIsModalVisible}
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: myTheme.white,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
    marginBottom: 10,
    width: "49%",
  },
  tagContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: 1,
  },
  image: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  contentContainer: {
    padding: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: "bold",
    color: myTheme.black,
  },
  soldText: {
    fontSize: 12,
    color: myTheme.gray[500],
    marginTop: 4,
  },
  priceContainer: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  currentPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: myTheme.red[500],
  },
  oldPrice: {
    fontSize: 12,
    textDecorationLine: "line-through",
    color: myTheme.gray[500],
    marginLeft: 5,
  },
  dialogContent: {
    maxHeight: "80%",
    overflow: "hidden",
  },
});

export default ProductCard;
