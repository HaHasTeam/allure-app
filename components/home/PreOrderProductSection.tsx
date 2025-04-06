import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  StyleSheet,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { getPreOrderProductFilterApi } from "@/hooks/api/pre-order";
import { myTheme } from "@/constants";
import PreOrderProductCard from "../product/PreOrderProductCard";
import Empty from "../empty";

function PreOrderProductSections() {
  const { t } = useTranslation();
  const { data: preOrderProductData, isLoading } = useQuery({
    queryKey: [getPreOrderProductFilterApi.queryKey, { page: 1, limit: 10 }],
    queryFn: getPreOrderProductFilterApi.fn,
    select: (data) => data.data,
  });

  const hasProducts =
    preOrderProductData?.items && preOrderProductData.items.length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="access-time" size={24} color={myTheme.primary} />
        <Text style={styles.title}>{t("home.preOrderTitle")}</Text>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={myTheme.primary} />
        </View>
      )}

      {!isLoading && !hasProducts && (
        <View style={styles.loadingContainer}>
          <Empty
            title={t("empty.preOrder.title")}
            description={t("empty.preOrder.description")}
          />{" "}
        </View>
      )}

      {!isLoading && hasProducts && (
        <FlatList
          data={preOrderProductData.items}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <PreOrderProductCard preOrderProduct={item} />
          )}
          contentContainerStyle={styles.productList}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: myTheme.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },
  productList: {
    gap: 12,
  },
});

export default PreOrderProductSections;
