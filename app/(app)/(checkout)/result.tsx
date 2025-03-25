import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

const result = () => {
  const { t } = useTranslation();
  return (
    <View>
      <Stack.Screen options={{ title: t("cart.result") }}></Stack.Screen>
      <Text>result</Text>
    </View>
  );
};

export default result;

const styles = StyleSheet.create({});
