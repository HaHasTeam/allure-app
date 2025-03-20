import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { Stack, useRouter } from "expo-router";
import { myTheme } from "@/constants";
import { useTranslation } from "react-i18next";
const forbidden = require("@/assets/images/Error.png");

const UnauthorizedScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const goToHome = () => {
    router.replace("/");
  };

  return (
    <>
      <Stack.Screen options={{ title: t("error.forbiddenTitle") }} />
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image source={forbidden} resizeMode="cover" />
        </View>

        <View style={styles.content}>
          <Text style={styles.text}>{t("error.forbidden")}</Text>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={goToHome}>
              <Text style={styles.buttonText}>{t("button.goToHome")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: myTheme.background,
    paddingHorizontal: 16,
    paddingVertical: 48,
  },
  imageContainer: {
    height: 300,
    width: "100%",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  content: {
    alignItems: "center",
    maxWidth: 300,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: myTheme.mutedForeground,
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 24,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: myTheme.primary,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
    color: myTheme.primaryForeground,
  },
});

export default UnauthorizedScreen;
