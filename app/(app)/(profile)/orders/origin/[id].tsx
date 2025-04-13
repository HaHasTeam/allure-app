import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Header, HeaderBackButton } from "@react-navigation/elements";
import { myTheme } from "@/constants";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/contexts/ToastContext";
import useHandleServerError from "@/hooks/useHandleServerError";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import {
  getParentOrderByIdApi,
  getStatusTrackingByIdApi,
} from "@/hooks/api/order";
import { getMasterConfigApi } from "@/hooks/api/master-config";
import { calculatePaymentCountdown } from "@/utils/order";

const OrderParentDetail = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [openCancelParentOrderDialog, setOpenCancelParentOrderDialog] =
    useState<boolean>(false);
  const [isTrigger, setIsTrigger] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const { data: useOrderData, isFetching } = useQuery({
    queryKey: [
      getParentOrderByIdApi.queryKey,
      (id as string) ?? ("" as string),
    ],
    queryFn: getParentOrderByIdApi.fn,
  });

  const { data: useStatusTrackingData } = useQuery({
    queryKey: [
      getStatusTrackingByIdApi.queryKey,
      (id as string) ?? ("" as string),
    ],
    queryFn: getStatusTrackingByIdApi.fn,
    enabled: !!id,
  });
  const { data: masterConfig } = useQuery({
    queryKey: [getMasterConfigApi.queryKey],
    queryFn: getMasterConfigApi.fn,
  });

  useEffect(() => {
    if (masterConfig && useOrderData && useOrderData.data) {
      setTimeLeft(
        calculatePaymentCountdown(useOrderData.data, masterConfig.data)
      );
      const timer = setInterval(() => {
        setTimeLeft(
          calculatePaymentCountdown(useOrderData.data, masterConfig.data)
        );
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [useOrderData, masterConfig]);

  useEffect(() => {
    queryClient.invalidateQueries({
      queryKey: [getParentOrderByIdApi.queryKey],
    });
  }, [isTrigger, queryClient]);

  return (
    <View>
      <Stack.Screen
        options={{
          header: () => (
            <Header
              headerLeft={() => (
                <HeaderBackButton
                  label="Quay lại"
                  tintColor={myTheme.primary}
                  labelStyle={{
                    fontWeight: "bold",
                    color: myTheme.primary,
                    backgroundColor: myTheme.primary,
                  }}
                  onPress={() => router.back()}
                />
              )}
              title={
                useOrderData?.data?.id
                  ? t("orderDetail.title") +
                    " " +
                    `#${useOrderData?.data?.id?.substring(0, 8).toUpperCase()}`
                  : t("orderDetail.title")
              }
              headerTitleStyle={{
                fontWeight: "bold",
                color: myTheme.primary,
              }}
            />
          ),
        }}
      />
      <Text>OrderParentDetail</Text>
    </View>
  );
};

export default OrderParentDetail;

const styles = StyleSheet.create({});
