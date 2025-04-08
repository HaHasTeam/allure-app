import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Stack, useRouter } from "expo-router";
import useCartStore from "@/store/cart";
import { useToast } from "@/contexts/ToastContext";
import useHandleServerError from "@/hooks/useHandleServerError";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IAddress } from "@/types/address";
import {
  IBrandBestVoucher,
  ICheckoutItem,
  IPlatformBestVoucher,
  TVoucher,
} from "@/types/voucher";
import {
  calculateCartTotals,
  calculatePlatformVoucherDiscount,
  calculateTotalBrandVoucherDiscount,
  calculateTotalCheckoutBrandVoucherDiscount,
} from "@/utils/price";
import { DiscountTypeEnum, PaymentMethod, ResultEnum } from "@/types/enum";
import { Form, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getBestPlatformVouchersApi,
  getBestShopVouchersApi,
} from "@/hooks/api/voucher";
import useUser from "@/hooks/api/useUser";
import { getMyAddressesApi } from "@/hooks/api/address";
import { createGroupOderApi, createOderApi } from "@/hooks/api/order";
import { getMyCartApi } from "@/hooks/api/cart";
import { updateOrderGroupBuyingApi } from "@/hooks/api/group-buying";
import {
  ICreateGroupOrder,
  ICreateOrder,
  IUpdateGroupOrder,
} from "@/types/order";
import { createCheckoutItem, createCheckoutItems } from "@/utils/cart";
import { OrderItemCreation } from "@/components/checkout/OrderItemsCreation";
import { getCreateOrderSchema } from "@/schema/order.schema";
import useAuth from "@/hooks/api/useAuth";
import LoadingContentLayer from "@/components/loading/LoadingContentLayer";
import Empty from "@/components/empty";
import { myTheme } from "@/constants";
import CheckoutItem from "@/components/checkout/CheckoutItem";
import CheckoutHeader from "@/components/checkout/CheckoutHeader";
import { ProjectInformationEnum } from "@/types/project";
import CheckoutTotal from "@/components/checkout/CheckoutTotal";
import AddressSection from "@/components/address/AddressSection";
import {
  AntDesign,
  FontAwesome6,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import VoucherPlatformList from "@/components/voucher/VoucherPlatformList";

const checkout = () => {
  const { t } = useTranslation();
  const formId = useId();
  const {
    selectedCartItem,
    chosenPlatformVoucher,
    setChosenPlatformVoucher,
    setChosenBrandVouchers,
    chosenBrandVouchers,
    resetCart,
    groupBuyingOrder,
    groupBuying,
  } = useCartStore();
  const isInGroupBuying = !!groupBuying;
  const { showToast } = useToast();
  const handleServerError = useHandleServerError();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [myAddresses, setMyAddresses] = useState<IAddress[]>([]);
  const [openVoucherList, setOpenVoucherList] = useState(false);
  const [bestBrandVouchers, setBestBrandVouchers] = useState<
    IBrandBestVoucher[]
  >([]);
  const [bestPlatformVoucher, setBestPlatformVoucher] =
    useState<IPlatformBestVoucher | null>(null);
  const queryClient = useQueryClient();
  const { getProfile } = useUser();
  const CreateOrderSchema = getCreateOrderSchema();

  const selectedCartItems = useMemo(() => {
    return selectedCartItem
      ? Object.values(selectedCartItem).flatMap((cartBrandItems) =>
          cartBrandItems.map((item) => item.id)
        )
      : [];
  }, [selectedCartItem]);
  const voucherMap = bestBrandVouchers.reduce<{
    [key: string]: IBrandBestVoucher;
  }>((acc, voucher) => {
    acc[voucher.brandId] = voucher;
    return acc;
  }, {});

  const totalProductCost = useMemo(() => {
    return calculateCartTotals(selectedCartItems, selectedCartItem)
      .totalProductCost;
  }, [selectedCartItem, selectedCartItems]);
  const totalPrice = useMemo(() => {
    return calculateCartTotals(selectedCartItems, selectedCartItem).totalPrice;
  }, [selectedCartItem, selectedCartItems]);
  // Calculate total voucher discount
  // const totalBrandDiscount = useMemo(() => {
  //   return calculateTotalBrandVoucherDiscount(selectedCartItem, selectedCartItems, chosenBrandVouchers)
  // }, [chosenBrandVouchers, selectedCartItems, selectedCartItem])
  const totalBrandBEDiscount = useMemo(() => {
    return calculateTotalCheckoutBrandVoucherDiscount(chosenBrandVouchers);
  }, [chosenBrandVouchers]);
  const totalBrandDiscount = useMemo(() => {
    return calculateTotalBrandVoucherDiscount(
      selectedCartItem,
      selectedCartItems,
      chosenBrandVouchers
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCartItem, chosenBrandVouchers, selectedCartItems]);
  const platformVoucherDiscount = useMemo(() => {
    return calculatePlatformVoucherDiscount(
      selectedCartItem,
      selectedCartItems,
      chosenPlatformVoucher,
      chosenBrandVouchers
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedCartItem,
    selectedCartItems,
    chosenPlatformVoucher,
    totalBrandDiscount,
    chosenBrandVouchers,
  ]);

  // Calculate platform voucher discount
  // const totalPlatformDiscount = useMemo(() => {
  //   return calculatePlatformVoucherDiscount(chosenPlatformVoucher)
  // }, [chosenPlatformVoucher])

  const totalProductDiscount = useMemo(() => {
    return calculateCartTotals(selectedCartItems, selectedCartItem)
      .totalProductDiscount;
  }, [selectedCartItem, selectedCartItems]);

  // Total saved price (product discounts + brand vouchers + platform voucher)
  const totalSavings =
    totalProductDiscount + totalBrandDiscount + (platformVoucherDiscount ?? 0);
  const totalPayment =
    totalPrice - totalBrandDiscount - (platformVoucherDiscount ?? 0);

  const bottomSheetPlatformVoucherModalRef = useRef<BottomSheetModal>(null);
  const togglePlatformVoucherVisibility = () => {
    if (openVoucherList) {
      bottomSheetPlatformVoucherModalRef.current?.close(); // Close modal if it's visible
    } else {
      bottomSheetPlatformVoucherModalRef.current?.present(); // Open modal if it's not visible
    }
    setOpenVoucherList(!openVoucherList); // Toggle the state
  };

  const defaultOrderValues = {
    orders: [],
    addressId: "",
    paymentMethod: isInGroupBuying ? PaymentMethod.WALLET : PaymentMethod.CASH,
    platformVoucherId: "", // Optional field, default to an empty string
  };

  // const handleReset = () => {
  //   form.reset();
  // };
  // const form = useForm<z.infer<typeof CreateOrderSchema>>({
  //   resolver: zodResolver(CreateOrderSchema),
  //   defaultValues: defaultOrderValues,
  // });
  const {
    control,
    handleSubmit,
    resetField,
    reset,
    watch,
    register,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof CreateOrderSchema>>({
    resolver: zodResolver(CreateOrderSchema),
    defaultValues: defaultOrderValues,
  });
  const handleReset = () => {
    reset();
  };

  const { data: useMyAddressesData, isFetching: isGettingAddress } = useQuery({
    queryKey: [getMyAddressesApi.queryKey],
    queryFn: getMyAddressesApi.fn,
  });
  // const { data: useMyCartData, isFetching: isGettingCart } = useQuery({
  //   queryKey: [getMyCartApi.queryKey],
  //   queryFn: getMyCartApi.fn,
  // })
  const { mutateAsync: callBestBrandVouchersFn } = useMutation({
    mutationKey: [getBestShopVouchersApi.mutationKey],
    mutationFn: getBestShopVouchersApi.fn,
    onSuccess: (data) => {
      console.log(data);
      setBestBrandVouchers(data?.data);
    },
  });
  const { mutateAsync: callBestPlatformVouchersFn } = useMutation({
    mutationKey: [getBestPlatformVouchersApi.mutationKey],
    mutationFn: getBestPlatformVouchersApi.fn,
    onSuccess: (data) => {
      setBestPlatformVoucher(data?.data);
    },
  });

  const { mutateAsync: createOrderFn } = useMutation({
    mutationKey: [createOderApi.mutationKey],
    mutationFn: createOderApi.fn,
    onSuccess: (orderData) => {
      showToast(t("order.success"), "success", 4000);
      resetCart();
      handleReset();
      router.push({
        pathname: "/result",
        params: { status: ResultEnum.SUCCESS },
      });
    },
  });

  const { mutateAsync: createGroupOrderFn } = useMutation({
    mutationKey: [createGroupOderApi.mutationKey],
    mutationFn: createGroupOderApi.fn,
    onSuccess: () => {
      showToast(t("order.success"), "success", 4000);
      queryClient.invalidateQueries({
        queryKey: [getMyCartApi.queryKey],
      });

      handleReset();
      router.push({
        pathname: "/result",
        params: { status: ResultEnum.SUCCESS },
      });
    },
  });

  const { mutateAsync: updateGroupOrder } = useMutation({
    mutationKey: [updateOrderGroupBuyingApi.mutationKey],
    mutationFn: updateOrderGroupBuyingApi.fn,
    onSuccess: () => {
      showToast(t("order.success"), "success", 4000);
      queryClient.invalidateQueries({
        queryKey: [getMyCartApi.queryKey],
      });

      handleReset();
      router.push({
        pathname: "/result",
        params: { status: ResultEnum.SUCCESS },
      });
    },
  });
  async function onSubmit(values: z.infer<typeof CreateOrderSchema>) {
    try {
      console.log(values);
      setIsLoading(true);
      const orders = OrderItemCreation({
        values,
        selectedCartItem,
        chosenBrandVouchers,
      });
      if (groupBuying) {
        if (groupBuyingOrder) {
          const formData: IUpdateGroupOrder = {
            orderId: groupBuyingOrder.id,
            addressId: values.addressId,
            items: orders[0].items,
          };
          await updateGroupOrder(formData);
          return;
        }
        const formData: ICreateGroupOrder = {
          addressId: values.addressId,
          groupBuyingId: groupBuying.id,
          items: orders[0].items,
        };
        await createGroupOrderFn(formData);
      } else {
        const formData: ICreateOrder = {
          ...values,
          orders,
          platformVoucherId: chosenPlatformVoucher?.id ?? "", // Optional
        };

        await createOrderFn(formData);
      }

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      handleServerError({
        error,
      });
    }
  }

  const handleVoucherSelection = (
    brandId: string,
    voucher: TVoucher | null
  ) => {
    setChosenBrandVouchers({ ...chosenBrandVouchers, [brandId]: voucher });
  };

  const handleVoucherChange = (voucher: TVoucher | null) => {
    setChosenPlatformVoucher(voucher);
  };

  useEffect(() => {
    const handleAddress = async () => {
      const user = await getProfile();
      if (user && useMyAddressesData?.data) {
        setMyAddresses(useMyAddressesData?.data);
      }
    };
    handleAddress();
  }, [getProfile, useMyAddressesData]);

  useEffect(() => {
    async function handleShowBestBrandVoucher() {
      try {
        if (selectedCartItem) {
          const checkoutItems = createCheckoutItems(
            selectedCartItem,
            selectedCartItems
          );
          await callBestBrandVouchersFn({
            checkoutItems: checkoutItems,
          });
        }
      } catch (error) {
        console.error(error);
      }
    }
    async function handleShowBestPlatformVoucher() {
      try {
        let checkoutItems: ICheckoutItem[] = [];
        if (selectedCartItem) {
          checkoutItems = Object.entries(selectedCartItem)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .map(([_brandName, cartItems]) =>
              createCheckoutItem(cartItems, selectedCartItems)
            )
            .flat();
        }

        await callBestPlatformVouchersFn({
          checkoutItems: checkoutItems,
        });
      } catch (error) {
        console.error(error);
      }
    }

    handleShowBestBrandVoucher();
    handleShowBestPlatformVoucher();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCartItem, selectedCartItems]);

  return (
    <SafeAreaView
      style={
        !selectedCartItem || Object.keys(selectedCartItem)?.length === 0
          ? styles.emptyContainer
          : styles.container
      }
    >
      <Stack.Screen options={{ title: t("cart.checkout") }} />
      {isGettingAddress && <LoadingContentLayer />}
      {selectedCartItem && Object.keys(selectedCartItem)?.length > 0 && (
        <ScrollView style={styles.contentContainer}>
          <View style={styles.innerContainer}>
            <View style={styles.formContainer}>
              <View style={styles.leftColumn}>
                {/* <CheckoutHeader /> */}
                {selectedCartItem &&
                  Object.keys(selectedCartItem).map((brandName, index) => {
                    const brand =
                      selectedCartItem[brandName]?.[0]?.productClassification
                        ?.productDiscount?.product?.brand ??
                      selectedCartItem[brandName]?.[0]?.productClassification
                        ?.preOrderProduct?.product?.brand ??
                      selectedCartItem[brandName]?.[0]?.productClassification
                        ?.product?.brand;

                    const brandId = brand?.id ?? "";
                    const bestVoucherForBrand = voucherMap[brandId] || null;
                    const chosenVoucherForBrand =
                      chosenBrandVouchers[brandId] || null;

                    return (
                      <CheckoutItem
                        key={`${brandName}_${index}`}
                        isInGroupBuying={isInGroupBuying}
                        brand={brand}
                        brandName={brandName}
                        cartBrandItem={selectedCartItem[brandName]}
                        onVoucherSelect={handleVoucherSelection}
                        bestVoucherForBrand={bestVoucherForBrand}
                        chosenBrandVoucher={chosenVoucherForBrand}
                        index={index}
                        watch={watch}
                        register={register}
                        setValue={setValue}
                      />
                    );
                  })}
              </View>

              <View style={styles.rightColumn}>
                <AddressSection
                  setValue={setValue}
                  addresses={useMyAddressesData?.data ?? []}
                />

                {!isInGroupBuying && (
                  <View style={styles.voucherSection}>
                    <View style={styles.voucherHeader}>
                      <AntDesign name="tags" color="red" size={20} />
                      <Text style={styles.voucherTitle}>
                        {ProjectInformationEnum.name} {t("cart.voucher")}
                      </Text>
                    </View>

                    <VoucherPlatformList
                      triggerText={
                        <View>
                          {chosenPlatformVoucher ? (
                            chosenPlatformVoucher?.discountType ===
                              DiscountTypeEnum.AMOUNT &&
                            chosenPlatformVoucher?.discountValue ? (
                              <View style={styles.commonFlex}>
                                <Text style={styles.link}>
                                  {t("voucher.discountAmount", {
                                    amount: platformVoucherDiscount,
                                  })}
                                </Text>
                                <MaterialCommunityIcons
                                  name="pencil"
                                  size={16}
                                  color={myTheme.blue[500]}
                                />
                              </View>
                            ) : (
                              <View style={styles.commonFlex}>
                                <Text style={styles.link}>
                                  {t("voucher.discountAmount", {
                                    amount: platformVoucherDiscount,
                                  })}{" "}
                                </Text>
                                <MaterialCommunityIcons
                                  name="pencil"
                                  size={16}
                                  color={myTheme.blue[500]}
                                />
                              </View>
                            )
                          ) : bestPlatformVoucher?.bestVoucher ? (
                            bestPlatformVoucher?.bestVoucher?.discountType ===
                              DiscountTypeEnum.AMOUNT &&
                            bestPlatformVoucher?.bestVoucher?.discountValue ? (
                              <Text style={styles.link}>
                                {t("voucher.bestDiscountAmountDisplay", {
                                  amount:
                                    bestPlatformVoucher?.bestVoucher
                                      ?.discountValue,
                                })}
                              </Text>
                            ) : (
                              <Text style={styles.link}>
                                {t("voucher.bestDiscountPercentageDisplay", {
                                  percentage:
                                    bestPlatformVoucher?.bestVoucher
                                      ?.discountValue * 100,
                                })}
                              </Text>
                            )
                          ) : (
                            <Text style={styles.link}>
                              {t("cart.selectVoucher")}
                            </Text>
                          )}
                        </View>
                      }
                      bottomSheetModalRef={bottomSheetPlatformVoucherModalRef}
                      setIsModalVisible={setOpenVoucherList}
                      toggleModalVisibility={togglePlatformVoucherVisibility}
                      handleVoucherChange={handleVoucherChange}
                      onConfirmVoucher={setChosenPlatformVoucher}
                      selectedCartItems={selectedCartItems}
                      chosenPlatformVoucher={chosenPlatformVoucher}
                      cartByBrand={selectedCartItem}
                      bestPlatFormVoucher={bestPlatformVoucher}
                    />
                  </View>
                )}

                {/* {!isInGroupBuying && (
                  <PaymentSelection
                    form={form}
                    hasPreOrderProduct={hasPreOrderProduct()}
                  />
                )} */}

                <CheckoutTotal
                  formId={formId}
                  isLoading={isLoading}
                  totalProductDiscount={totalProductDiscount}
                  totalProductCost={totalProductCost}
                  totalBrandDiscount={totalBrandDiscount}
                  totalPlatformDiscount={platformVoucherDiscount ?? 0}
                  totalSavings={totalSavings}
                  totalPayment={totalPayment}
                  handleSubmit={handleSubmit}
                  onSubmit={onSubmit}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      )}
      {(!selectedCartItem || Object.keys(selectedCartItem)?.length === 0) && (
        <Empty
          title={t("empty.checkout.title")}
          description={t("empty.checkout.description")}
          link={"/"}
          linkText={t("empty.checkout.button")}
        />
      )}
    </SafeAreaView>
  );
};

export default checkout;

const styles = StyleSheet.create({
  link: {
    color: myTheme.blue[500],
  },
  spaceBetween: {
    justifyContent: "space-between",
  },
  commonFlexColumn: {
    flexDirection: "column",
    gap: 10,
  },
  commonFlex: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  cartContainer: {
    flex: 1,
    flexDirection: "column",
    alignContent: "center",
    justifyContent: "flex-start",
  },
  container: {
    flex: 1,
    // position: "relative",
    flexDirection: "column",
    alignContent: "center",
    justifyContent: "flex-start",
    backgroundColor: myTheme.background,
  },
  emptyContainer: {
    flex: 1,
    flexDirection: "column",
    alignContent: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
    backgroundColor: myTheme.background,
  },
  contentContainer: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    marginVertical: 16,
  },
  formContainer: {
    paddingHorizontal: 5,
  },
  leftColumn: {},
  rightColumn: {
    marginTop: 10,
  },
  voucherSection: {
    flexDirection: "column",
    gap: 6,
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginVertical: 10,
  },
  voucherHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  voucherTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
});
