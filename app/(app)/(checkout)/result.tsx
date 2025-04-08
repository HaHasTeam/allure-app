import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Result from "@/components/result/Result";
import { ResultEnum } from "@/types/enum";
import { myTheme } from "@/constants";
import { Header } from "@react-navigation/elements";

// interface ResultProps {
//   status: ResultEnum.SUCCESS | ResultEnum.FAILURE;
//   orderId: string;
// }
const result = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { status } = useLocalSearchParams();
  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          header: () => (
            <Header
              title={t("cart.result")}
              headerTitleStyle={{
                color: myTheme.primary,
                fontWeight: "bold",
              }}
            />
          ),
        }}
      ></Stack.Screen>
      <View style={styles.contentContainer}>
        <Result
          status={status as ResultEnum}
          title={
            status === ResultEnum.SUCCESS
              ? t("order.success")
              : t("order.failure")
          }
          description={
            status === ResultEnum.SUCCESS
              ? t("order.successDescription")
              : t("order.failureDescription")
          }
          leftButtonAction={
            status === ResultEnum.SUCCESS
              ? () => router.replace(`/(profile)/orders/`)
              : () => router.replace("/")
          }
          rightButtonAction={
            status === ResultEnum.SUCCESS
              ? () => router.replace("/")
              : () => router.replace(`/(profile)/orders/`)
          }
          leftButtonText={
            status === ResultEnum.SUCCESS
              ? t("order.viewOrder")
              : t("order.continueShopping")
          }
          rightButtonText={
            status === ResultEnum.SUCCESS
              ? t("order.continueShopping")
              : t("order.tryAgain")
          }
        />
      </View>
    </View>
  );
};

export default result;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: myTheme.background,
  },
  contentContainer: {
    flex: 1,
  },
});
