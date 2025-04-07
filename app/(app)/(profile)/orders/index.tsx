import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";

import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import OrderItem from "@/components/order/OrderItem";
import { OrderRequestFilter } from "@/components/order/OrderRequestFilter";
import SearchOrders from "@/components/order/SearchOrders";
import {
  OrderRequestTypeEnum,
  RequestStatusEnum,
  ShippingStatusEnum,
} from "@/types/enum";
import {
  IOrderFilter,
  IOrderItem,
  IRequest,
  IRequestFilter,
} from "@/types/order";
import { getMyOrdersApi, getMyRequestsApi } from "@/hooks/api/order";
import Empty from "@/components/empty";
import LoadingContentLayer from "@/components/loading/LoadingContentLayer";
import { myTheme } from "@/constants";
import { Picker } from "react-native-ui-lib";
import TriggerList from "@/components/ui/tabs";
import { Stack } from "expo-router";

export default function ProfileOrder() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<IOrderItem[]>([]);
  const [requests, setRequests] = useState<IRequest[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isTrigger, setIsTrigger] = useState<boolean>(false);

  const [requestTypes, setRequestTypes] = useState<OrderRequestTypeEnum[]>([]);
  const [requestStatuses, setRequestStatuses] = useState<RequestStatusEnum[]>(
    []
  );

  const simplifiedTriggers = useMemo(
    () => [
      { value: "all", text: `${t("order.all")}` },
      {
        value: "pending",
        text: `${t("requestStatus.pending")}`,
        statuses: [
          ShippingStatusEnum.JOIN_GROUP_BUYING,
          ShippingStatusEnum.TO_PAY,
          ShippingStatusEnum.WAIT_FOR_CONFIRMATION,
        ],
      },
      {
        value: "processing",
        text: `${t("order.processing")}`,
        statuses: [
          ShippingStatusEnum.PREPARING_ORDER,
          ShippingStatusEnum.TO_SHIP,
        ],
      },
      {
        value: "shipping",
        text: `${t("order.delivering")}`,
        statuses: [ShippingStatusEnum.SHIPPING],
      },
      {
        value: "delivered",
        text: `${t("order.delivered")}`,
        statuses: [ShippingStatusEnum.DELIVERED],
      },
      {
        value: "completed",
        text: `${t("order.completed")}`,
        statuses: [ShippingStatusEnum.COMPLETED],
      },
      {
        value: "returns",
        text: `${t("order.returns")}`,
        statuses: [
          ShippingStatusEnum.RETURNING,
          ShippingStatusEnum.BRAND_RECEIVED,
          ShippingStatusEnum.RETURNED_FAIL,
          ShippingStatusEnum.REFUNDED,
        ],
      },
      {
        value: "cancelled",
        text: `${t("order.cancelled")}`,
        statuses: [ShippingStatusEnum.CANCELLED],
      },
      { value: "request", text: `${t("order.requestManagement")}` },
    ],
    [t]
  );
  const { mutateAsync: getMyOrderFn } = useMutation({
    mutationKey: [getMyOrdersApi.mutationKey],
    mutationFn: getMyOrdersApi.fn,
    onSuccess: (data) => {
      setOrders(data?.data);
      setIsLoading(false);
    },
  });
  const { mutateAsync: getMyRequestFn } = useMutation({
    mutationKey: [getMyRequestsApi.mutationKey],
    mutationFn: getMyRequestsApi.fn,
    onSuccess: (data) => {
      setRequests(data?.data);
      setIsLoading(false);
    },
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  const handleRequestFilterChange = (
    types: OrderRequestTypeEnum[],
    statuses: RequestStatusEnum[]
  ) => {
    setRequestTypes(types);
    setRequestStatuses(statuses);
    // Trigger refetch with new filters
    setIsTrigger((prev) => !prev);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      if (activeTab === "request") {
        const requestFilters: IRequestFilter = {
          types: requestTypes.length > 0 ? requestTypes : undefined,
          statusList: requestStatuses.length > 0 ? requestStatuses : undefined,
          search: searchQuery || undefined,
        };
        console.log(requestTypes);
        await getMyRequestFn(requestFilters);
      } else {
        let statusFilters;

        const selectedTrigger = simplifiedTriggers.find(
          (trigger) => trigger.value === activeTab
        );

        // If it's a group with multiple statuses, use them all
        if (selectedTrigger?.statuses) {
          statusFilters = selectedTrigger.statuses;
        }
        // If it's "all", don't filter by status
        else if (activeTab === "all") {
          statusFilters = undefined;
        }
        // Otherwise, use the single status value
        else {
          statusFilters = [activeTab.toUpperCase()];
        }

        const filters: IOrderFilter = {
          statusList: statusFilters,
          search: searchQuery || undefined,
        };
        await getMyOrderFn(filters);
      }
    };

    fetchOrders();
  }, [
    activeTab,
    getMyOrderFn,
    searchQuery,
    isTrigger,
    simplifiedTriggers,
    getMyRequestFn,
    requestTypes,
    requestStatuses,
  ]);

  const renderOrderItem = ({ item }: { item: IOrderItem }) => {
    return (
      <View style={styles.orderItemContainer}>
        <OrderItem
          brand={
            item?.orderDetails?.[0]?.productClassification?.preOrderProduct
              ?.product?.brand ??
            item?.orderDetails?.[0]?.productClassification?.productDiscount
              ?.product?.brand ??
            item?.orderDetails?.[0]?.productClassification?.product?.brand ??
            null
          }
          orderItem={item}
          setIsTrigger={setIsTrigger}
        />
      </View>
    );
  };
  const renderRequestItem = ({ item }: { item: IRequest }) => {
    return (
      <View style={styles.orderItemContainer}>
        <OrderItem
          brand={
            item?.order?.orderDetails[0]?.productClassification?.preOrderProduct
              ?.product?.brand ??
            item?.order?.orderDetails[0]?.productClassification?.productDiscount
              ?.product?.brand ??
            item?.order?.orderDetails[0]?.productClassification?.product
              ?.brand ??
            null
          }
          orderItem={item?.order}
          setIsTrigger={setIsTrigger}
        />
      </View>
    );
  };

  const renderEmpty = () => {
    return (
      <View style={styles.emptyContainer}>
        <Empty
          title={t("empty.order.title")}
          description={
            activeTab === "all"
              ? t("empty.order.description")
              : t("empty.order.statusDescription")
          }
        />
      </View>
    );
  };

  const renderOptions = () => {
    return simplifiedTriggers.map((trigger) => (
      <Picker.Item
        key={trigger.value}
        value={trigger.value}
        label={trigger.text}
      />
    ));
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.triggerButton,
        activeTab === item.value && styles.activeTrigger,
      ]}
      onPress={() => setActiveTab(item.value)}
    >
      <Text
        style={[
          styles.triggerText,
          activeTab === item.value && styles.activeText,
        ]}
      >
        {item.text}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen options={{ title: t("order.myOrder") }} />
      {isLoading && <LoadingContentLayer />}
      <View style={styles.container}>
        <View style={styles.contentContainer}>
          {/* Dropdown for mobile */}
          {/* <View style={styles.pickerContainer}>
            <Picker
              value={activeTab}
              onChange={(value) => setActiveTab((value as string) ?? "all")}
              placeholder={
                simplifiedTriggers.find(
                  (trigger) => trigger.value === activeTab
                )?.text || t("order.all")
              }
              containerStyle={styles.picker}
            >
              {renderOptions()}
            </Picker>
          </View> */}
          <TriggerList
            renderItem={renderItem}
            simplifiedTriggers={simplifiedTriggers}
          />

          <View style={styles.contentWrapper}>
            <View style={styles.searchContainer}>
              {activeTab === "request" ? (
                <View style={styles.filterContainer}>
                  <OrderRequestFilter
                    onFilterChange={handleRequestFilterChange}
                  />
                </View>
              ) : (
                <SearchOrders onSearch={handleSearch} />
              )}
            </View>

            {(activeTab === "request" &&
              !isLoading &&
              requests?.length === 0) ||
            (activeTab !== "request" && !isLoading && orders?.length === 0) ? (
              renderEmpty()
            ) : activeTab === "request" &&
              !isLoading &&
              requests?.length > 0 ? (
              <FlatList
                data={requests}
                showsHorizontalScrollIndicator={false}
                renderItem={renderRequestItem}
                keyExtractor={(item) => item?.id.toString()}
                contentContainerStyle={styles.listContainer}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            ) : activeTab !== "request" && !isLoading && orders?.length > 0 ? (
              <FlatList
                data={orders}
                showsHorizontalScrollIndicator={false}
                renderItem={renderOrderItem}
                keyExtractor={(item) => item?.id.toString()}
                contentContainerStyle={styles.listContainer}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            ) : null}
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  triggerButton: {
    paddingHorizontal: 2,
    paddingVertical: 3,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
    marginRight: 16,
  },
  activeTrigger: {
    borderBottomColor: myTheme.primary,
  },
  triggerText: {
    fontSize: 16,
    color: "#666666",
  },
  activeText: {
    color: myTheme.primary,
    fontWeight: 600,
  },
  container: {
    width: "100%",
    alignItems: "center",
    flex: 1,
  },
  contentContainer: {
    width: "100%",
    padding: 10,
    maxWidth: Dimensions.get("window").width,
    flex: 1,
  },
  pickerContainer: {
    marginBottom: 16,
  },
  picker: {
    borderWidth: 1,
    borderColor: myTheme.primary,
    borderRadius: 8,
  },
  contentWrapper: {
    marginTop: 8,
    flex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  filterContainer: {
    width: "100%",
    alignItems: "flex-end",
  },
  listContainer: {
    paddingBottom: 20,
  },
  separator: {
    height: 10,
  },
  orderItemContainer: {
    backgroundColor: myTheme.white,
    borderWidth: 1,
    borderColor: myTheme.gray[200],
    borderRadius: 8,
  },
  emptyContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 400,
  },
});
