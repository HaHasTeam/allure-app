import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Stack } from "expo-router";

const checkout = () => {
  const { t } = useTranslation();
  return (
    <View>
      <Stack.Screen options={{ title: t("cart.checkout") }} />
      <Text>checkout</Text>
    </View>
  );
};

export default checkout;

const styles = StyleSheet.create({});
