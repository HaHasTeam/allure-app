import { myTheme } from "@/constants";
import { StyleSheet, Text, View } from "react-native";
import ConsultationCard from "./ConsultationCard";
import { useTranslation } from "react-i18next";

export default function BeautyConsulting() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{t("home.consultantTitle")}</Text>
      <View style={styles.cardContainer}>
        <ConsultationCard
          title={t("home.standardConsultantTitle")}
          description={t("home.standardConsultantDescription")}
          icon="star"
          linkTo={"/"}
        />
        <ConsultationCard
          title={t("home.premiumConsultantTitle")}
          description={t("home.premiumConsultantDescription")}
          icon="shopping-cart"
          linkTo={"/"}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    color: myTheme.primary,
  },
  cardContainer: {
    gap: 12,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconContainer: {
    padding: 8,
    backgroundColor: myTheme.orange[100],
    borderRadius: 8,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: myTheme.gray[500],
  },
});
