import { myTheme } from "@/constants";
import { Feather } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface BrandHeaderProps {
  brandName: string;
  brandId: string;
  brandLogo: string;
}

const BrandHeader = ({ brandName, brandId, brandLogo }: BrandHeaderProps) => {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{brandName}</Text>
      <Text style={styles.subtitle}>
        {t("brand.lastOnline", { time: "59 Minutes" })}
      </Text>
      <View style={styles.buttonContainer}>
        {/* <TouchableOpacity
          style={[
            styles.chatButton,
            { backgroundColor: myTheme.primary },
            isNavigating && styles.disabledButton
          ]}
          onPress={handleClick}
          disabled={isNavigating}
        >
          <Feather name="message-square" size={16} color="white" style={styles.icon} />
          <Text style={styles.buttonText}>
            {isNavigating ? t('brand.creating') : t('brand.chatNow')}
          </Text>
        </TouchableOpacity> */}
        <Link href={`/(app)/brands/${brandId}`} asChild>
          <TouchableOpacity style={styles.shopButton}>
            <Feather
              name="shopping-bag"
              size={16}
              color={myTheme.primary}
              style={styles.icon}
            />
            <Text style={[styles.shopButtonText, { color: myTheme.primary }]}>
              {t("brand.viewShop")}
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: myTheme.foreground,
  },
  subtitle: {
    fontSize: 14,
    color: myTheme.mutedForeground,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
  },
  chatButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 4,
  },
  disabledButton: {
    opacity: 0.8,
  },
  shopButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: myTheme.primary,
  },
  buttonText: {
    color: "white",
    fontSize: 14,
  },
  shopButtonText: {
    fontSize: 14,
  },
  icon: {
    marginRight: 8,
  },
});

export default BrandHeader;
