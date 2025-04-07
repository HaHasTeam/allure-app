import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { Link } from "expo-router";
import { StyleSheet, View, Text, TouchableOpacity, Image } from "react-native";
import { myTheme } from "@/constants";

interface BrandOrderInformationProps {
  brandName: string;
  brandId: string;
  brandLogo: string;
}

const BrandOrderInformation = ({
  brandName,
  brandId,
  brandLogo,
}: BrandOrderInformationProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.brandInfo}>
          {brandLogo && (
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: brandLogo }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
              {!brandLogo && (
                <View style={styles.avatarFallback}>
                  <Text style={styles.avatarFallbackText}>
                    {brandName.charAt(0).toUpperCase() || "A"}
                  </Text>
                </View>
              )}
            </View>
          )}
          <Link href={`/(app)/brands/${brandId}`}>
            <Text style={styles.brandName}>{brandName}</Text>
          </Link>
        </View>
        <View style={styles.buttonContainer}>
          {/* <TouchableOpacity
            style={[styles.chatButton, { backgroundColor: myTheme.primary }]}
          >
            <Feather
              name="message-square"
              size={16}
              color="white"
              style={styles.chatIcon}
            />
            <Text style={styles.buttonText}>{t('brand.chatNow')}</Text>
          </TouchableOpacity> */}
          <Link href={`/(app)/brands/${brandId}`} asChild>
            <TouchableOpacity style={styles.shopButton}>
              <Feather
                name="shopping-bag"
                size={16}
                color={myTheme.primary}
                style={styles.shopIcon}
              />
              <Text style={[styles.shopButtonText, { color: myTheme.primary }]}>
                {t("brand.viewShop")}
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    width: "100%",
    padding: 16,
    borderRadius: 8,
  },
  content: {
    flexDirection: "column",
  },
  brandInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarFallback: {
    width: "100%",
    height: "100%",
    backgroundColor: myTheme.gray[200],
    justifyContent: "center",
    alignItems: "center",
  },
  avatarFallbackText: {
    fontSize: 16,
    color: myTheme.foreground,
    fontWeight: "bold",
  },
  brandName: {
    fontSize: 20,
    fontWeight: "bold",
    color: myTheme.foreground,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  chatIcon: {
    marginRight: 4,
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
    height: 32,
  },
  shopIcon: {
    marginRight: 4,
  },
  buttonText: {
    color: "white",
    fontSize: 12,
  },
  shopButtonText: {
    fontSize: 12,
    fontWeight: "500",
  },
});

export default BrandOrderInformation;
