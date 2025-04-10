import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { myTheme } from "@/constants";

interface SoldProgressProps {
  soldAmount: number;
  maxAmount: number;
}

export default function SoldProgress({
  soldAmount,
  maxAmount,
}: SoldProgressProps) {
  const { t } = useTranslation();
  const progress = Math.min(Math.max(soldAmount / maxAmount, 0), 1) * 100;

  return (
    <View style={styles.container}>
      <View style={[styles.progressBar, { width: `${progress}%` }]} />
      <View style={styles.textContainer}>
        <Text style={styles.text}>
          {t("productCard.soldFlashSale", {
            amount: soldAmount ? soldAmount : 0,
          })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: myTheme.red[200],
    height: 20,
    borderRadius: 10,
    position: "relative",
    justifyContent: "center",
  },
  progressBar: {
    position: "absolute",
    height: "100%",
    backgroundColor: myTheme.red[500],
    borderRadius: 10,
  },
  textContainer: {
    position: "absolute",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "white",
    textTransform: "uppercase",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});
