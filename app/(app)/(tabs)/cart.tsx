import React, { useEffect, useState, useCallback, useMemo } from "react";

import { SafeAreaView } from "react-native-safe-area-context";

import MyText from "@/components/common/MyText";
import { myFontWeight, myTheme } from "../../../constants/index";
import Empty from "@/components/empty";
import { useTranslation } from "react-i18next";
import {
  FloatingButton,
  FloatingButtonLayouts,
  View,
} from "react-native-ui-lib";
import { FlatList, StyleSheet } from "react-native";
import CartHeader from "@/components/cart/CartHeader";
import {
  IBrandBestVoucher,
  ICheckoutItem,
  IPlatformBestVoucher,
  TVoucher,
} from "@/types/voucher";
import { ICartByBrand } from "@/types/cart";
import useCartStore from "@/store/cart";
import {
  calculateCartTotals,
  calculatePlatformVoucherDiscount,
  calculateTotalBrandVoucherDiscount,
} from "@/utils/price";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createCheckoutItem, createCheckoutItems } from "@/utils/cart";
import {
  getBestPlatformVouchersApi,
  getBestShopVouchersApi,
} from "@/hooks/api/voucher";
import { getMyCartApi } from "@/hooks/api/cart";
import LoadingContentLayer from "@/components/loading/LoadingContentLayer";
import CartItem from "@/components/cart/CartItem";
import CartFooter from "@/components/cart/CartFooter";
import CartAdditional from "@/components/cart/CartAdditional";

const CartScreen = () => {
  const { t } = useTranslation();
  const [selectedCartItems, setSelectedCartItems] = useState<string[]>([]);
  const [allCartItemIds, setAllCartItemIds] = useState<string[]>([]);
  const [isAllSelected, setIsAllSelected] = useState<boolean>(false);
  const [cartByBrand, setCartByBrand] = useState<ICartByBrand | undefined>(
    undefined
  );
  const [bestBrandVouchers, setBestBrandVouchers] = useState<
    IBrandBestVoucher[]
  >([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [isTriggerTotal, setIsTriggerTotal] = useState<boolean>(false);
  const [totalOriginalPrice, setTotalOriginalPrice] = useState<number>(0);
  const [totalDirectProductsDiscount, setTotalDirectProductsDiscount] =
    useState<number>(0);
  const [chosenVouchersByBrand, setChosenVouchersByBrand] = useState<{
    [brandId: string]: TVoucher | null;
  }>({});
  const [platformChosenVoucher, setPlatformChosenVoucher] =
    useState<TVoucher | null>(null);
  const {
    cartItems,
    setChosenBrandVouchers,
    setChosenPlatformVoucher,
    setSelectedCartItem,
    resetSelectedCartItem,
    setCartItems,
  } = useCartStore();
  const [bestPlatformVoucher, setBestPlatformVoucher] =
    useState<IPlatformBestVoucher | null>(null);

  const voucherMap = bestBrandVouchers?.reduce<{
    [key: string]: IBrandBestVoucher;
  }>((acc, voucher) => {
    acc[voucher?.brandId] = voucher;
    return acc;
  }, {});

  // Calculate total voucher discount
  const totalVoucherDiscount = useMemo(() => {
    return calculateTotalBrandVoucherDiscount(
      cartItems,
      selectedCartItems,
      chosenVouchersByBrand
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartItems, chosenVouchersByBrand, selectedCartItems, isTriggerTotal]);
  // Calculate platform voucher discount
  const platformVoucherDiscount = useMemo(() => {
    return calculatePlatformVoucherDiscount(
      cartItems,
      selectedCartItems,
      platformChosenVoucher,
      chosenVouchersByBrand
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    cartItems,
    selectedCartItems,
    isTriggerTotal,
    platformChosenVoucher,
    totalVoucherDiscount,
    chosenVouchersByBrand,
  ]);

  // Total saved price (product discounts + brand vouchers + platform voucher)
  const savedPrice =
    totalDirectProductsDiscount +
    totalVoucherDiscount +
    platformVoucherDiscount;
  const totalFinalPrice =
    totalPrice - totalVoucherDiscount - platformVoucherDiscount;

  const { data: useMyCartData, isFetching } = useQuery({
    queryKey: [getMyCartApi.queryKey],
    queryFn: getMyCartApi.fn,
  });

  const { mutateAsync: callBestBrandVouchersFn } = useMutation({
    mutationKey: [getBestShopVouchersApi.mutationKey],
    mutationFn: getBestShopVouchersApi.fn,
    onSuccess: (data) => {
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

  // Handler for "Select All" checkbox
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedCartItems([]); // Deselect all
    } else {
      setSelectedCartItems(allCartItemIds); // Select all
    }
  };

  // Update the state when brand-level selection changes
  const handleSelectBrand = (cartItemIds: string[], isSelected: boolean) => {
    setSelectedCartItems((prev) => {
      if (isSelected) {
        // Add all cartItems of the brand
        return [...prev, ...cartItemIds.filter((id) => !prev.includes(id))];
      } else {
        // Remove all cartItems of the brand
        return prev.filter((id) => !cartItemIds.includes(id));
      }
    });
  };
  const handleVoucherSelection = (
    brandId: string,
    voucher: TVoucher | null
  ) => {
    setChosenVouchersByBrand((prev) => ({
      ...prev,
      [brandId]: voucher,
    }));
    setChosenBrandVouchers({ ...chosenVouchersByBrand, [brandId]: voucher });
  };

  useEffect(() => {
    if (cartItems) {
      setCartByBrand(cartItems);

      const selectedCartItemsMap = Object.keys(cartItems).reduce(
        (acc, brandName) => {
          const brandCartItems = cartItems[brandName];
          const selectedItems = brandCartItems.filter((cartItem) =>
            selectedCartItems.includes(cartItem.id)
          );

          if (selectedItems.length > 0) {
            acc[brandName] = selectedItems;
          }

          return acc;
        },
        {} as ICartByBrand
      );

      setSelectedCartItem(selectedCartItemsMap);

      // handle set selected checkbox cart items
      const tmpAllCartItemIds = Object.values(cartItems).flatMap((cartBrand) =>
        cartBrand.map((cartItem) => cartItem.id)
      );
      setAllCartItemIds(tmpAllCartItemIds);
      setIsAllSelected(
        tmpAllCartItemIds.every((id) => selectedCartItems.includes(id))
      );

      const validSelectedCartItems = selectedCartItems.filter((id) =>
        tmpAllCartItemIds.includes(id)
      );
      if (validSelectedCartItems.length !== selectedCartItems.length) {
        setSelectedCartItems(validSelectedCartItems);
      }

      // handle show best voucher for each brand
      async function handleShowBestBrandVoucher() {
        try {
          if (cartItems) {
            const checkoutItems = createCheckoutItems(
              cartItems,
              selectedCartItems
            );
            // await callBestBrandVouchersFn({
            //   checkoutItems: checkoutItems,
            // });
          }
        } catch (error) {
          console.error(error);
        }
      }
      async function handleShowBestPlatformVoucher() {
        try {
          let checkoutItems: ICheckoutItem[] = [];
          if (cartItems) {
            checkoutItems = Object.entries(cartItems)
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              .map(([_brandName, cartItems]) =>
                createCheckoutItem(cartItems, selectedCartItems)
              )
              .flat();
          }

          // await callBestPlatformVouchersFn({
          //   checkoutItems: checkoutItems,
          // });
        } catch (error) {
          console.error(error);
        }
      }

      handleShowBestBrandVoucher();
      handleShowBestPlatformVoucher();
    }
  }, [
    callBestBrandVouchersFn,
    callBestPlatformVouchersFn,
    cartItems,
    selectedCartItems,
    setSelectedCartItem,
  ]);

  useEffect(() => {
    if (selectedCartItems?.length > 0) {
      setTotalPrice(
        calculateCartTotals(selectedCartItems, cartItems).totalPrice
      );
      setTotalOriginalPrice(
        calculateCartTotals(selectedCartItems, cartItems).totalProductCost
      );
      setTotalDirectProductsDiscount(
        calculateCartTotals(selectedCartItems, cartItems).totalProductDiscount
      );
    } else {
      setTotalPrice(0);
      setTotalOriginalPrice(0);
      setTotalDirectProductsDiscount(0);
      setChosenVouchersByBrand({});

      setPlatformChosenVoucher(null);
      setChosenPlatformVoucher(null);
      resetSelectedCartItem();
    }
  }, [
    cartItems,
    resetSelectedCartItem,
    selectedCartItems,
    setChosenPlatformVoucher,
    isTriggerTotal,
  ]);
  useEffect(() => {
    setChosenPlatformVoucher(platformChosenVoucher);
  }, [platformChosenVoucher, setChosenPlatformVoucher]);

  useEffect(() => {
    if (totalVoucherDiscount === 0) {
      setChosenVouchersByBrand({});
    }
    if (platformVoucherDiscount === 0) {
      setPlatformChosenVoucher(null);
    }
  }, [
    platformVoucherDiscount,
    totalVoucherDiscount,
    isTriggerTotal,
    selectedCartItems,
  ]);

  useEffect(() => {
    if (useMyCartData && useMyCartData?.data) {
      const filteredData: ICartByBrand = {};

      Object.keys(useMyCartData.data).forEach((brandName) => {
        const filteredItems = useMyCartData.data[brandName].filter(
          (item) => item.groupBuying === null
        );

        if (filteredItems.length > 0) {
          filteredData[brandName] = filteredItems;
        }
      });

      setCartItems(filteredData);
    }
  }, [useMyCartData?.data]);
  console.log(cartItems);
  return (
    <SafeAreaView
      style={
        cartItems && Object.keys(cartItems)?.length > 0
          ? styles.container
          : styles.emptyContainer
      }
    >
      {isFetching && <LoadingContentLayer />}
      {!isFetching && cartItems && Object.keys(cartItems)?.length > 0 && (
        <>
          {/* Cart Header */}
          <CartHeader
            onCheckAll={handleSelectAll}
            isAllSelected={isAllSelected}
            totalCartItems={allCartItemIds?.length}
            cartItemCountAll={allCartItemIds?.length}
            cartItemCount={selectedCartItems?.length}
            setSelectedCartItems={setSelectedCartItems}
            cartByBrand={cartItems}
            selectedCartItems={selectedCartItems}
          />
          {/* Cart Item List */}
          <FlatList
            showsHorizontalScrollIndicator={false}
            data={Object.keys(cartItems).map((brandName, index) => {
              const brand =
                cartItems[brandName]?.[0]?.productClassification
                  ?.productDiscount?.product?.brand ??
                cartItems[brandName]?.[0]?.productClassification
                  ?.preOrderProduct?.product?.brand ??
                cartItems[brandName]?.[0]?.productClassification?.product
                  ?.brand;
              const brandId = brand?.id ?? "";
              const bestVoucherForBrand = voucherMap[brandId] || null;
              const cartBrandItem = cartItems[brandName];
              const checkoutItems: ICheckoutItem[] = cartBrandItem
                ?.map((cartItem) => ({
                  classificationId: cartItem.productClassification?.id ?? "",
                  quantity: cartItem.quantity ?? 0,
                }))
                ?.filter((item) => item.classificationId !== null);

              const selectedCheckoutItems: ICheckoutItem[] = cartBrandItem
                ?.filter((cart) => selectedCartItems?.includes(cart?.id))
                ?.map((cartItem) => ({
                  classificationId: cartItem.productClassification?.id ?? "",
                  quantity: cartItem.quantity ?? 0,
                }))
                ?.filter((item) => item.classificationId !== null);

              return {
                key: `${brandName}_${index}`,
                brandName,
                cartBrandItem,
                brand,
                bestVoucherForBrand,
                checkoutItems,
                selectedCheckoutItems,
              };
            })}
            renderItem={({ item }) => (
              <CartItem
                key={item.key}
                brandName={item.brandName}
                cartBrandItem={item.cartBrandItem}
                selectedCartItems={selectedCartItems}
                onSelectBrand={handleSelectBrand}
                bestVoucherForBrand={item.bestVoucherForBrand}
                onVoucherSelect={handleVoucherSelection}
                brand={item.brand}
                checkoutItems={item.checkoutItems}
                selectedCheckoutItems={item.selectedCheckoutItems}
                setIsTriggerTotal={setIsTriggerTotal}
                isTriggerTotal={isTriggerTotal}
              />
            )}
            keyExtractor={(item) => item.key}
            style={styles.cartItemsContainer}
          />
          {/* Cart Footer */}
          <CartFooter
            cartItemCountAll={allCartItemIds?.length}
            cartItemCount={selectedCartItems?.length}
            setSelectedCartItems={setSelectedCartItems}
            onCheckAll={handleSelectAll}
            isAllSelected={isAllSelected}
            totalOriginalPrice={totalOriginalPrice}
            selectedCartItems={selectedCartItems}
            totalProductDiscount={totalDirectProductsDiscount}
            totalVoucherDiscount={totalVoucherDiscount}
            savedPrice={savedPrice}
            totalFinalPrice={totalFinalPrice}
            platformChosenVoucher={platformChosenVoucher}
            setPlatformChosenVoucher={setPlatformChosenVoucher}
            platformVoucherDiscount={platformVoucherDiscount}
            cartByBrand={cartItems}
            bestPlatformVoucher={bestPlatformVoucher}
          />
        </>
      )}
      {/* <CartAdditional
        selectedCartItems={selectedCartItems}
        setSelectedCartItems={setSelectedCartItems}
      /> */}
      {!isFetching && cartItems && Object.keys(cartItems)?.length === 0 && (
        <Empty
          title={t("empty.cart.title")}
          description={t("empty.cart.description")}
          link={"/"}
          linkText={t("empty.cart.button")}
        />
      )}
    </SafeAreaView>
  );
};

export default CartScreen;
const styles = StyleSheet.create({
  cartContainer: {
    flex: 1,
    flexDirection: "column",
    alignContent: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 4,
    paddingVertical: 10,
    backgroundColor: myTheme.background,
  },
  container: {
    flex: 1,
    // position: "relative",
    flexDirection: "column",
    alignContent: "center",
    justifyContent: "flex-start",
  },
  cartItemsContainer: {
    marginBottom: 100,
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
});
