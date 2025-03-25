import { StyleSheet, Text, View } from "react-native";
import React, { useEffect, useId, useMemo, useState } from "react";
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
import { PaymentMethod, ResultEnum } from "@/types/enum";
import { useForm } from "react-hook-form";
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
  console.log(groupBuyingOrder, "PPPP");

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

  const defaultOrderValues = {
    orders: [],
    addressId: "",
    paymentMethod: isInGroupBuying ? PaymentMethod.WALLET : PaymentMethod.CASH,
    platformVoucherId: "", // Optional field, default to an empty string
  };

  const handleReset = () => {
    form.reset();
  };
  const form = useForm<z.infer<typeof CreateOrderSchema>>({
    resolver: zodResolver(CreateOrderSchema),
    defaultValues: defaultOrderValues,
  });

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
        form,
      });
    }
  }

  const handleVoucherSelection = (
    brandId: string,
    voucher: TVoucher | null
  ) => {
    setChosenBrandVouchers({ ...chosenBrandVouchers, [brandId]: voucher });
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
    <View>
      <Stack.Screen options={{ title: t("cart.checkout") }} />
      <Text>checkout</Text>
    </View>
  );
};

export default checkout;

const styles = StyleSheet.create({});
