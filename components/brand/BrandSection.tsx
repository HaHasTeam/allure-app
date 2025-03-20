import { StyleSheet, Text, View } from "react-native";
import React from "react";
import MyLink from "../common/MyLink";
import { Ionicons } from "@expo/vector-icons";
import { Checkbox } from "react-native-ui-lib";
import { myTheme } from "@/constants";
import { Link } from "expo-router";

interface BrandSectionProps {
  brandName: string;
  brandId: string;
  isBrandSelected: boolean;
  handleBrandSelect: (value: boolean) => void;
}
const BrandSection = ({
  brandName,
  brandId,
  handleBrandSelect,
  isBrandSelected,
}: BrandSectionProps) => {
  return (
    <View>
      <View style={styles.container}>
        {/* group product of brand checkbox */}
        <Checkbox
          value={isBrandSelected}
          onValueChange={handleBrandSelect}
          style={styles.checkbox}
          color={myTheme.primary}
          size={20}
        />
        <Ionicons name="storefront-sharp" size={24} style={styles.icon} />
        <Link href="/" style={styles.brandNameLink}>
          <Text numberOfLines={2}>{brandName}</Text>
        </Link>
      </View>
    </View>
  );
};

export default BrandSection;

const styles = StyleSheet.create({
  icon: {
    color: myTheme.primary,
  },
  container: {
    paddingTop: 6,
    flex: 1,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  brandNameLink: {
    fontWeight: "medium",
  },

  checkbox: {
    alignSelf: "center",
    borderRadius: 6,
  },
});
