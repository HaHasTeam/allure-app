import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Result from "@/components/result/Result";
import { ResultEnum } from "@/types/enum";

interface ResultProps {
  status: ResultEnum.SUCCESS | ResultEnum.FAILURE;
  orderId: string;
}
const result = ({ status, orderId }: ResultProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <View>
      <Stack.Screen options={{ title: t("cart.result") }}></Stack.Screen>
      <Result
        status={status}
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
            ? () => router.replace(`/(profile)/orders/${orderId}`)
            : () => router.replace("/")
        }
        rightButtonAction={
          status === ResultEnum.SUCCESS
            ? () => router.replace("/")
            : () => router.replace(`/(profile)/orders/${orderId}`)
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
  );
};

export default result;

const styles = StyleSheet.create({});
