import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import useHandleServerError from "@/hooks/useHandleServerError";

import { IBrand } from "@/types/brand";
import { OrderEnum, RequestStatusEnum, ShippingStatusEnum } from "@/types/enum";
import { IOrderItem } from "@/types/order";

import CancelOrderDialog from "./CancelOrderDialog";
import ProductOrderLandscape from "./ProductOrderLandscape";
import RequestCancelOrderDialog from "./RequestCancelOrderDialog";
import { RequestReturnOrderDialog } from "./RequestReturnOrderDialog";
import {
  getCancelAndReturnRequestApi,
  getOrderByIdApi,
  getStatusTrackingByIdApi,
  updateOrderStatusApi,
} from "@/hooks/api/order";
import { Link, useRouter } from "expo-router";
import { getMasterConfigApi } from "@/hooks/api/master-config";
import { createCartItemApi, getMyCartApi } from "@/hooks/api/cart";
import { getRequestStatusColor } from "../request-status";
import LoadingIcon from "../loading/LoadingIcon";
import OrderStatus from "../order-status";
import { myTheme } from "@/constants";
import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import MyText from "../common/MyText";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import ImageWithFallback from "../image/ImageWithFallBack";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useToast } from "@/contexts/ToastContext";

interface OrderItemProps {
  brand: IBrand | null;
  orderItem: IOrderItem;
  setIsTrigger: Dispatch<SetStateAction<boolean>>;
}
const OrderItem = ({ brand, orderItem, setIsTrigger }: OrderItemProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [openRequestCancelOrderDialog, setOpenRequestCancelOrderDialog] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openCancelOrderDialog, setOpenCancelOrderDialog] = useState(false);
  const [openRequestReturnOrderDialog, setOpenRequestReturnOrderDialog] =
    useState<boolean>(false);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const toggleModalVisibility = () => {
    if (openCancelOrderDialog) {
      bottomSheetModalRef.current?.close(); // Close modal if it's visible
    } else {
      bottomSheetModalRef.current?.present(); // Open modal if it's not visible
    }
    setOpenCancelOrderDialog(!openCancelOrderDialog); // Toggle the state
  };
  const bottomSheetModalRequestCancelRef = useRef<BottomSheetModal>(null);
  const toggleModalRequestCancelVisibility = () => {
    if (openRequestCancelOrderDialog) {
      bottomSheetModalRequestCancelRef.current?.close(); // Close modal if it's visible
    } else {
      bottomSheetModalRequestCancelRef.current?.present(); // Open modal if it's not visible
    }
    setOpenRequestCancelOrderDialog(!openRequestCancelOrderDialog); // Toggle the state
  };
  const bottomSheetModalRequestReturnRef = useRef<BottomSheetModal>(null);
  const toggleModalRequestReturnVisibility = () => {
    if (openRequestReturnOrderDialog) {
      bottomSheetModalRequestReturnRef.current?.close(); // Close modal if it's visible
    } else {
      bottomSheetModalRequestReturnRef.current?.present(); // Open modal if it's not visible
    }
    setOpenRequestReturnOrderDialog(!openRequestReturnOrderDialog); // Toggle the state
  };

  const { data: cancelAndReturnRequestData } = useQuery({
    queryKey: [
      getCancelAndReturnRequestApi.queryKey,
      orderItem.id ?? ("" as string),
    ],
    queryFn: getCancelAndReturnRequestApi.fn,
    enabled: !!orderItem.id,
  });
  const { data: useStatusTrackingData } = useQuery({
    queryKey: [
      getStatusTrackingByIdApi.queryKey,
      orderItem.id ?? ("" as string),
    ],
    queryFn: getStatusTrackingByIdApi.fn,
    enabled: !!orderItem.id,
  });
  const { data: masterConfig } = useQuery({
    queryKey: [getMasterConfigApi.queryKey],
    queryFn: getMasterConfigApi.fn,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const handleServerError = useHandleServerError();
  const { mutateAsync: createCartItemFn } = useMutation({
    mutationKey: [createCartItemApi.mutationKey],
    mutationFn: createCartItemApi.fn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [getMyCartApi.queryKey],
      });
      showToast(t("cart.addToCartSuccess"), "success", 4000);
    },
  });

  const handleCreateCartItem = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      if (orderItem?.orderDetails?.length) {
        await Promise.all(
          orderItem.orderDetails.map((productOrder) =>
            createCartItemFn({
              classification: productOrder?.productClassification?.title,
              productClassification: productOrder?.productClassification?.id,
              quantity: 1,
            })
          )
        );
      }
    } catch (error) {
      handleServerError({ error });
    } finally {
      setIsProcessing(false);
    }
  };

  const { mutateAsync: updateOrderStatusFn } = useMutation({
    mutationKey: [updateOrderStatusApi.mutationKey],
    mutationFn: updateOrderStatusApi.fn,
    onSuccess: async () => {
      showToast(t("order.receivedOrderStatusSuccess"), "success", 4000);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [getOrderByIdApi.queryKey] }),
        queryClient.invalidateQueries({
          queryKey: [getStatusTrackingByIdApi.queryKey],
        }),
      ]);
      setIsTrigger((prev) => !prev);
    },
  });
  async function handleUpdateStatus(values: string) {
    try {
      setIsLoading(true);
      await updateOrderStatusFn({ id: orderItem?.id, status: values });
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      handleServerError({
        error,
      });
    }
  }

  const showReturnButton = useMemo(() => {
    const isOrderDeliveredRecently = () => {
      const deliveredStatusTrack = useStatusTrackingData?.data?.find(
        (track) => track.status === ShippingStatusEnum.DELIVERED
      );

      if (!deliveredStatusTrack?.createdAt) return false;

      const deliveredDate = new Date(deliveredStatusTrack.createdAt);
      const currentDate = new Date();
      const allowedTimeInMs = masterConfig?.data[0].refundTimeExpired
        ? parseInt(masterConfig?.data[0].refundTimeExpired)
        : null;
      console.log(currentDate.getTime() - deliveredDate.getTime());
      return allowedTimeInMs
        ? currentDate.getTime() - deliveredDate.getTime() <= allowedTimeInMs
        : true;
    };
    return (
      (orderItem?.status === ShippingStatusEnum.DELIVERED ||
        orderItem?.status === ShippingStatusEnum.COMPLETED) &&
      !cancelAndReturnRequestData?.data?.refundRequest &&
      isOrderDeliveredRecently()
    );
  }, [
    cancelAndReturnRequestData?.data?.refundRequest,
    masterConfig?.data,
    orderItem?.status,
    useStatusTrackingData?.data,
  ]);
  const showReceivedButton = useMemo(() => {
    const isOrderDeliveredRecently = () => {
      const deliveredStatusTrack = useStatusTrackingData?.data?.find(
        (track) => track.status === ShippingStatusEnum.DELIVERED
      );

      if (!deliveredStatusTrack?.createdAt) return false;

      const deliveredDate = new Date(deliveredStatusTrack.createdAt);
      const currentDate = new Date();
      const allowedTimeInMs = masterConfig?.data[0].expiredCustomerReceivedTime
        ? parseInt(masterConfig?.data[0].expiredCustomerReceivedTime)
        : null;
      console.log(currentDate.getTime() - deliveredDate.getTime());
      return allowedTimeInMs
        ? currentDate.getTime() - deliveredDate.getTime() <= allowedTimeInMs
        : true;
    };
    return (
      orderItem?.status === ShippingStatusEnum.DELIVERED &&
      !cancelAndReturnRequestData?.data?.refundRequest &&
      isOrderDeliveredRecently()
    );
  }, [
    cancelAndReturnRequestData?.data?.refundRequest,
    masterConfig?.data,
    orderItem?.status,
    useStatusTrackingData?.data,
  ]);

  return (
    <>
      <View style={styles.container}>
        {/* Order Item Header */}
        <View style={styles.header}>
          {/* Brand */}
          <View style={styles.brandContainer}>
            <View style={styles.brandNameContainer}>
              <View style={styles.avatarContainer}>
                <ImageWithFallback
                  src={brand?.logo ?? ""}
                  alt={brand?.name}
                  resizeMode="cover"
                  style={styles.avatar}
                />
              </View>
              <TouchableOpacity
                onPress={() => router.push(`/brands/${brand?.id}`)}
              >
                <MyText
                  text={brand?.name ?? ""}
                  styleProps={styles.brandName}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.brandButtonsContainer}>
              {/* <TouchableOpacity style={styles.chatButton}>
                <Feather name="message-circle" size={16} color="white" />
                <MyText
                  text={t("brand.chat")}
                  styleProps={styles.chatButtonText}
                />
              </TouchableOpacity> */}
              <TouchableOpacity
                style={styles.viewShopButton}
                onPress={() => router.push(`/brands/${brand?.id}`)}
              >
                <Ionicons name="storefront" size={16} color={myTheme.primary} />
                <MyText
                  text={t("brand.viewShop")}
                  styleProps={styles.viewShopText}
                />
              </TouchableOpacity>
            </View>
          </View>
          {/* Order and request status */}
          <View style={styles.statusContainer}>
            {/* Order Status */}
            <View style={styles.orderStatusContainer}>
              <OrderStatus tag={orderItem?.status} />
            </View>
          </View>
        </View>

        {/* Product list */}
        <FlatList
          data={orderItem?.orderDetails || []}
          renderItem={({ item: productOder }) => (
            <TouchableOpacity
              onPress={() => router.push(`/(profile)/orders/${orderItem?.id}`)}
              key={productOder?.id}
              style={styles.productItem}
            >
              <ProductOrderLandscape
                orderDetail={productOder}
                product={
                  productOder?.productClassification?.preOrderProduct
                    ?.product ??
                  productOder?.productClassification?.productDiscount
                    ?.product ??
                  productOder?.productClassification?.product
                }
                productClassification={productOder?.productClassification}
                productType={
                  productOder?.productClassification?.preOrderProduct?.product
                    ? OrderEnum.PRE_ORDER
                    : productOder?.productClassification?.productDiscount
                        ?.product
                    ? OrderEnum.FLASH_SALE
                    : OrderEnum.NORMAL
                }
              />
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={null}
        />

        {/* total price */}
        <View style={styles.totalPriceContainer}>
          <MyText
            text={t("cart.totalPrice") + ": "}
            styleProps={styles.totalPriceLabel}
          />
          <MyText
            text={t("productCard.price", { price: orderItem?.totalPrice })}
            styleProps={styles.totalPriceValue}
          />
        </View>

        {/* Request Status Information (Enhanced) */}
        {(cancelAndReturnRequestData?.data?.refundRequest ||
          cancelAndReturnRequestData?.data?.cancelRequest ||
          cancelAndReturnRequestData?.data?.complaintRequest) && (
          <View style={styles.requestStatusContainer}>
            {cancelAndReturnRequestData?.data?.cancelRequest && (
              <View style={styles.requestRow}>
                <MyText
                  text={t("request.cancelRequest")}
                  styleProps={styles.requestLabel}
                />
                <View
                  style={[
                    styles.statusBadge,
                    getRequestStatusColor(
                      cancelAndReturnRequestData?.data?.cancelRequest?.status
                    ),
                  ]}
                >
                  <MyText
                    text={t(
                      `request.status.BRAND_${cancelAndReturnRequestData?.data?.cancelRequest?.status}`
                    )}
                    styleProps={[
                      styles.statusBadgeText,
                      getRequestStatusColor(
                        cancelAndReturnRequestData?.data?.cancelRequest?.status
                      ),
                    ]}
                  />
                </View>
              </View>
            )}
            {cancelAndReturnRequestData?.data?.refundRequest && (
              <View style={styles.requestColumn}>
                <View style={styles.requestRow}>
                  <MyText
                    text={t("request.returnRequest")}
                    styleProps={styles.requestLabel}
                  />
                  <View
                    style={[
                      styles.statusBadge,
                      getRequestStatusColor(
                        cancelAndReturnRequestData?.data?.refundRequest?.status
                      ),
                    ]}
                  >
                    <MyText
                      text={t(
                        `request.status.BRAND_${cancelAndReturnRequestData?.data?.refundRequest?.status}`
                      )}
                      styleProps={[
                        styles.statusBadgeText,
                        getRequestStatusColor(
                          cancelAndReturnRequestData?.data?.refundRequest
                            ?.status
                        ),
                      ]}
                    />
                  </View>
                </View>

                {/* Show rejection details if applicable */}
                {cancelAndReturnRequestData?.data?.refundRequest?.status ===
                  RequestStatusEnum.REJECTED && (
                  <>
                    {/* Show pending counter-request if any */}
                    {cancelAndReturnRequestData?.data?.refundRequest
                      ?.rejectedRefundRequest && (
                      <View style={styles.rejectedRequestContainer}>
                        <View style={styles.requestRow}>
                          <MyText
                            text={t("request.appealRequest")}
                            styleProps={styles.requestLabel}
                          />
                          <View
                            style={[
                              styles.statusBadge,
                              getRequestStatusColor(
                                cancelAndReturnRequestData?.data?.refundRequest
                                  ?.rejectedRefundRequest?.status
                              ),
                            ]}
                          >
                            <MyText
                              text={t(
                                `request.status.ADMIN_${cancelAndReturnRequestData?.data?.refundRequest?.rejectedRefundRequest?.status}`
                              )}
                              styleProps={[
                                styles.statusBadgeText,
                                getRequestStatusColor(
                                  cancelAndReturnRequestData?.data
                                    ?.refundRequest?.rejectedRefundRequest
                                    ?.status
                                ),
                              ]}
                            />
                          </View>
                        </View>
                        {cancelAndReturnRequestData?.data?.refundRequest
                          ?.rejectedRefundRequest?.status ===
                          RequestStatusEnum.PENDING && (
                          <MyText
                            text={t("request.awaitingResponse")}
                            styleProps={styles.awaitingResponseText}
                          />
                        )}
                      </View>
                    )}
                  </>
                )}
              </View>
            )}
            {cancelAndReturnRequestData?.data?.complaintRequest && (
              <View style={styles.requestColumn}>
                <View style={styles.requestRow}>
                  <MyText
                    text={t("request.complaintRequest")}
                    styleProps={styles.requestLabel}
                  />
                  <View
                    style={[
                      styles.statusBadge,
                      getRequestStatusColor(
                        cancelAndReturnRequestData?.data?.refundRequest
                          ?.status ?? ""
                      ),
                    ]}
                  >
                    <MyText
                      text={t(
                        `request.status.ADMIN_${cancelAndReturnRequestData?.data?.refundRequest?.status}`
                      )}
                      styleProps={[
                        styles.statusBadgeText,
                        getRequestStatusColor(
                          cancelAndReturnRequestData?.data?.refundRequest
                            ?.status ?? ""
                        ),
                      ]}
                    />
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Action button */}
        <View style={styles.actionContainer}>
          <View>
            <MyText
              text={
                t("order.lastUpdated") +
                ": " +
                t("date.toLocaleDateTimeString", {
                  val: new Date(orderItem?.updatedAt),
                })
              }
              styleProps={styles.lastUpdatedText}
            />
          </View>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => router.push(`/(profile)/orders/${orderItem?.id}`)}
            >
              <MyText
                text={t("order.viewDetail")}
                styleProps={styles.outlineButtonText}
              />
            </TouchableOpacity>

            {(orderItem?.status === ShippingStatusEnum.TO_PAY ||
              orderItem?.status ===
                ShippingStatusEnum.WAIT_FOR_CONFIRMATION) && (
              <TouchableOpacity
                style={styles.outlineButton}
                onPress={() => toggleModalVisibility()}
              >
                <MyText
                  text={t("order.cancelOrder")}
                  styleProps={styles.outlineButtonText}
                />
              </TouchableOpacity>
            )}

            {orderItem?.status === ShippingStatusEnum.PREPARING_ORDER &&
              !cancelAndReturnRequestData?.data?.cancelRequest && (
                <TouchableOpacity
                  style={styles.outlineButton}
                  onPress={() => toggleModalRequestCancelVisibility()}
                >
                  <MyText
                    text={t("order.cancelOrder")}
                    styleProps={styles.outlineButtonText}
                  />
                </TouchableOpacity>
              )}

            {showReturnButton && (
              <TouchableOpacity
                style={styles.outlineButton}
                onPress={() => toggleModalRequestReturnVisibility()}
              >
                <MyText
                  text={t("order.returnOrder")}
                  styleProps={styles.outlineButtonText}
                />
              </TouchableOpacity>
            )}

            {showReceivedButton && (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => {
                  handleUpdateStatus(ShippingStatusEnum.COMPLETED);
                }}
              >
                {isLoading ? (
                  <LoadingIcon color="primaryBackground" size="small" />
                ) : (
                  <MyText
                    text={t("order.received")}
                    styleProps={styles.primaryButtonText}
                  />
                )}
              </TouchableOpacity>
            )}

            {orderItem?.status === ShippingStatusEnum.COMPLETED && (
              <TouchableOpacity
                style={styles.outlineButton}
                onPress={() => handleCreateCartItem()}
              >
                {isProcessing ? (
                  <LoadingIcon color="primaryBackground" size="small" />
                ) : (
                  <MyText
                    text={t("order.buyAgain")}
                    styleProps={styles.outlineButtonText}
                  />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <CancelOrderDialog
        bottomSheetModalRef={bottomSheetModalRef}
        setIsModalVisible={setOpenCancelOrderDialog}
        toggleModalVisibility={toggleModalVisibility}
        onOpenChange={setOpenCancelOrderDialog}
        orderId={orderItem?.id ?? ""}
        setIsTrigger={setIsTrigger}
      />
      <RequestCancelOrderDialog
        bottomSheetModalRef={bottomSheetModalRequestCancelRef}
        setIsModalVisible={setOpenRequestCancelOrderDialog}
        toggleModalVisibility={toggleModalRequestCancelVisibility}
        onOpenChange={setOpenRequestCancelOrderDialog}
        orderId={orderItem?.id ?? ""}
        setIsTrigger={setIsTrigger}
      />
      <RequestReturnOrderDialog
        bottomSheetModalRef={bottomSheetModalRequestReturnRef}
        setIsModalVisible={setOpenRequestReturnOrderDialog}
        toggleModalVisibility={toggleModalRequestReturnVisibility}
        setIsTrigger={setIsTrigger}
        orderId={orderItem?.id ?? ""}
      />
    </>
  );
};

const styles = StyleSheet.create({
  avatarContainer: {
    width: 30,
    height: 30,
  },
  avatar: {
    borderRadius: 50,
    width: "100%",
    height: "100%",
  },
  container: {
    padding: 10,
  },
  header: {
    flexDirection: "column-reverse",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    paddingBottom: 8,
    marginBottom: 16,
  },
  brandContainer: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  brandNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandName: {
    width: "100%",
    flex: 1,
    fontWeight: 500,
    textOverflow: "ellipsis",
  },
  brandButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chatButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: myTheme.primary,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
    width: "auto",
  },
  chatButtonText: {
    color: "white",
    fontSize: 14,
  },
  viewShopButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: myTheme.primary,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 8,
    width: "auto",
  },
  viewShopText: {
    color: myTheme.primary,
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 4,
  },
  orderStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  productItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    marginBottom: 8,
  },
  totalPriceContainer: {
    width: "100%",
    marginLeft: "auto",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 4,
  },
  totalPriceLabel: {
    color: myTheme.mutedForeground,
    fontWeight: "500",
    fontSize: 18,
  },
  totalPriceValue: {
    color: myTheme.red[500],
    fontWeight: "600",
    fontSize: 18,
  },
  requestStatusContainer: {
    marginTop: 4,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#e5e5e5",
  },
  requestRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  requestColumn: {
    flexDirection: "column",
    gap: 8,
    marginTop: 8,
  },
  requestLabel: {
    fontWeight: "500",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusBadgeText: {
    textTransform: "uppercase",
    fontWeight: "700",
    fontSize: 12,
  },
  rejectedRequestContainer: {
    marginTop: 4,
  },
  awaitingResponseText: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 4,
  },
  actionContainer: {
    flexDirection: "column",
    alignItems: "flex-end",
    gap: 8,
    paddingTop: 10,
  },
  lastUpdatedText: {
    color: "#374151",
    fontSize: 14,
  },
  buttonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: myTheme.primary,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    width: "auto",
  },
  outlineButtonText: {
    color: myTheme.primary,
  },
  primaryButton: {
    backgroundColor: myTheme.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    width: "auto",
  },
  primaryButtonText: {
    color: "white",
  },
  checkbox: {
    alignSelf: "center",
    borderRadius: 6,
  },
});

export default OrderItem;
