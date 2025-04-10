import { StyleSheet, Text, View } from "react-native";
import React from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { Stack } from "expo-router";

const LanguageSwitcherScreen = () => {
  const { t } = useTranslation();
  return (
    <View>
      <Stack.Screen options={{ title: t("language.title") }} />
      <LanguageSwitcher />
    </View>
  );
};

export default LanguageSwitcherScreen;
