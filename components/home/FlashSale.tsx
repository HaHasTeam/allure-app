import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { getFlashSaleProductFilterApi } from "@/hooks/api/flash-sale";
import { FlashSaleStatusEnum } from "@/types/flash-sale";
import { Feather } from "@expo/vector-icons";
import { myTheme } from "@/constants";
import { Link } from "expo-router";
import Empty from "../empty";
import { Carousel } from "react-native-ui-lib";
import SaleProductCard from "../product/SaleProductCard";

const FlashSale = () => {
  const { t } = useTranslation();
  const { data: flashSaleProductData, isFetching } = useQuery({
    queryKey: [
      getFlashSaleProductFilterApi.queryKey,
      { page: 1, limit: 10, statuses: `${FlashSaleStatusEnum.ACTIVE}` },
    ],
    queryFn: getFlashSaleProductFilterApi.fn,
    select: (data) => data.data,
  });
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{t("flashSale.title")}</Text>
          <Feather name="zap" size={20} color={myTheme.red[500]} />
        </View>
        <Link href={"/products/productFlashSale"} style={styles.link}>
          <Text style={styles.linkText}>{t("button.seeAll")}</Text>
          <Feather name="arrow-right" size={16} color={myTheme.primary} />
        </Link>
      </View>

      {isFetching && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={myTheme.primary} />
        </View>
      )}

      {!isFetching &&
        (!flashSaleProductData || flashSaleProductData.items.length === 0) && (
          <View style={styles.loadingContainer}>
            <Empty
              title={t("empty.flashSale.title")}
              description={t("empty.flashSale.description")}
            />
          </View>
        )}

      {!isFetching &&
        flashSaleProductData &&
        flashSaleProductData.items.length > 0 && (
          <View style={styles.carouselContainer}>
            <Carousel
              pageWidth={(Dimensions.get("window").width - 60) * 0.7}
              itemSpacings={8}
              containerMarginHorizontal={0}
              initialPage={0}
              containerStyle={styles.carousel}
              pageControlPosition={Carousel.pageControlPositions.UNDER}
            >
              {flashSaleProductData.items.map((product) => (
                <View key={product?.id} style={styles.carouselItem}>
                  <SaleProductCard product={product} />
                </View>
              ))}
            </Carousel>
          </View>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  carousel: {},
  carouselContainer: {
    position: "relative",
  },
  carouselItem: {
    marginBottom: 4,
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: myTheme.red[500],
  },
  link: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  linkText: {
    color: myTheme.primary,
  },
  loadingContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  productCardContainer: {
    padding: 8,
  },
});

export default FlashSale;
