"use client";

import React, { useRef, useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import ProductItem from "./product-item";
import type { IResponseProduct } from "@/types/product";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";

import { useTranslation } from "react-i18next";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { getMyCartApi, createCartItemApi } from "@/hooks/api/cart/index";
import useHandleServerError from "@/hooks/useHandleServerError";
import { useToast } from "@/contexts/ToastContext";
import { getCheapestClassification } from "@/utils/product";
import {
  DiscountTypeEnum,
  OrderEnum,
  ProductEnum,
  StatusEnum,
} from "@/types/enum";
import { calculateDiscountPrice } from "@/utils/price";
import { useRouter } from "expo-router";
import ProductClassificationBottomSheet from "./product-classification-bottom-sheet";
import type { IClassification } from "@/types/classification";
import { createCartFromProduct } from "@/utils/cart";
import useCartStore from "@/store/cart";
import type { IProduct } from "@/types/product";

export interface LiveSteamDetail {
  id: string;
  createdAt: string;
  updatedAt: string;
  discount: number;
  product: IResponseProduct;
}

interface ProductSelectionBottomSheetProps {
  products: LiveSteamDetail[];
  visible: boolean;
  onClose: () => void;
  livestreamId?: string; // Optional prop for livestream ID
}

const ProductSelectionBottomSheet = ({
  products,
  visible,
  onClose,
  livestreamId, // Use provided livestreamId if available
}: ProductSelectionBottomSheetProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const handleServerError = useHandleServerError();
  const { setSelectedCartItem } = useCartStore();

  // Bottom sheet reference
  const bottomSheetRef = useRef<BottomSheet>(null);

  // State for classification bottom sheet
  const [classificationSheetVisible, setClassificationSheetVisible] =
    useState(false);
  const [currentAction, setCurrentAction] = useState<"cart" | "buy">("cart");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedLivestream, setSelectedLivestream] =
    useState<LiveSteamDetail | null>(null);

  const snapPoints = useMemo(() => ["70%"], []);

  // Get cart items count
  const { data: cartData, isLoading: isLoadingCart } = useQuery({
    queryKey: [getMyCartApi.queryKey],
    queryFn: getMyCartApi.fn,
    enabled: visible, // Only fetch when the bottom sheet is visible
  });

  const cartItemsCount = useMemo(() => {
    if (cartData?.data?.items) {
      return cartData.data.items.length;
    }
    return 0;
  }, [cartData]);

  // Setup mutation for adding to cart
  const { mutateAsync: createCartItemFn, isPending: isAddingToCart } =
    useMutation({
      mutationKey: [createCartItemApi.mutationKey],
      mutationFn: createCartItemApi.fn,
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: [getMyCartApi.queryKey],
        });
        showToast(t("cart.addToCartSuccess"), "success", 4000);
      },
      onError: (error) => {
        handleServerError({ error });
      },
    });

  // Handle close
  const handleClose = useCallback(() => {
    console.log("Closing bottom sheet");
    bottomSheetRef.current?.close();
    onClose();
  }, [onClose]);

  // Navigate to cart
  const handleGoToCart = useCallback(() => {
    handleClose();
    // Navigate to cart screen
    router.navigate("/(app)/cart");
  }, [router, handleClose]);

  // Handle sheet changes
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  // Render backdrop
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  // Handle add to cart with API call
  const handleAddToCart = async (
    product: any,
    livestreamDetail: LiveSteamDetail
  ) => {
    // Check if product has classifications
    if (!product.classifications || product.classifications.length === 0) {
      showToast(
        t("cart.noClassificationError") || "Product has no classification",
        "error",
        4000
      );
      return;
    }

    // Check if there's a DEFAULT classification
    const defaultClassification = product.classifications.find(
      (c: IClassification) => c.type === "DEFAULT"
    );

    if (defaultClassification) {
      // Use the default classification directly
      try {
        await createCartItemFn({
          quantity: 1,
          productClassification: defaultClassification.id,
          classification: defaultClassification.title ?? "",
          livestream: livestreamId || livestreamDetail.id, // Use provided livestreamId or from detail
          livestreamDiscount: livestreamDetail.discount, // Use actual discount from livestream
        });
      } catch (error) {
        console.error("Failed to add item to cart:", error);
      }
    } else {
      // Show bottom sheet for custom classification selection
      setCurrentAction("cart");
      setSelectedProduct(product);
      setSelectedLivestream(livestreamDetail);
      setClassificationSheetVisible(true);
    }
  };

  // Handle buy now with auto-close
  const handleBuyNow = async (
    product: any,
    livestreamDetail: LiveSteamDetail
  ) => {
    // Check if product has classifications
    if (!product.classifications || product.classifications.length === 0) {
      showToast(
        t("cart.noClassificationError") || "Product has no classification",
        "error",
        4000
      );
      return;
    }

    // Check if there's a DEFAULT classification
    const defaultClassification = product.classifications.find(
      (c: IClassification) => c.type === "DEFAULT"
    );

    if (defaultClassification) {
      try {
        // Create cart item object using the utility function
        const cartItem = createCartFromProduct(
          product as IProduct,
          1, // quantity
          defaultClassification as IClassification,
          {
            id: livestreamId || livestreamDetail.id, // Use provided livestreamId or from detail
            discount: livestreamDetail.discount, // Use actual discount from livestream
          }
        );

        // Set the selected cart item in the store
        setSelectedCartItem(cartItem);

        // Close the bottom sheet
        handleClose();

        // Navigate to checkout
        router.navigate("/(app)/checkout");
      } catch (error) {
        console.error("Failed to process buy now:", error);
        showToast(
          t("cart.buyNowError") || "Failed to process buy now",
          "error",
          4000
        );
      }
    } else {
      // Show bottom sheet for custom classification selection
      setCurrentAction("buy");
      setSelectedProduct(product);
      setSelectedLivestream(livestreamDetail);
      setClassificationSheetVisible(true);
    }
  };

  // Handle classification selection and add to cart
  const handleAddToCartWithClassification = async (
    classificationId: string,
    quantity: number,
    title?: string
  ) => {
    try {
      if (!selectedLivestream) return;

      await createCartItemFn({
        quantity,
        productClassification: classificationId,
        classification: title ?? "",
        livestream: livestreamId || selectedLivestream.id, // Use provided livestreamId or from selected livestream
        livestreamDiscount: selectedLivestream.discount, // Use actual discount from selected livestream
      });
    } catch (error) {
      console.error("Failed to add item to cart:", error);
    }
  };

  // Handle classification selection and buy now
  const handleBuyNowWithClassification = async (
    classificationId: string,
    quantity: number,
    title?: string
  ) => {
    try {
      if (!selectedProduct || !selectedLivestream) return;

      // Find the selected classification object
      const selectedClassification = selectedProduct.classifications.find(
        (c: IClassification) => c.id === classificationId
      );

      if (!selectedClassification) {
        throw new Error("Selected classification not found");
      }

      // Create cart item object using the utility function
      const cartItem = createCartFromProduct(
        selectedProduct as IProduct,
        quantity,
        selectedClassification as IClassification,
        {
          id: livestreamId || selectedLivestream.id, // Use provided livestreamId or from selected livestream
          discount: selectedLivestream.discount, // Use actual discount from selected livestream
        }
      );

      // Set the selected cart item in the store
      setSelectedCartItem(cartItem);

      // Close the bottom sheet
      handleClose();

      // Navigate to checkout
      router.navigate("/(app)/checkout");
    } catch (error) {
      console.error("Failed to process buy now:", error);
      showToast(
        t("cart.buyNowError") || "Failed to process buy now",
        "error",
        4000
      );
    }
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Feather name="shopping-bag" size={64} color="#CBD5E1" />
      <Text style={styles.emptyText}>No products available</Text>
      <Text style={styles.emptySubtext}>
        There are no products to display at this time
      </Text>
    </View>
  );

  // Effect to open/close the bottom sheet based on visible prop
  React.useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        handleIndicatorStyle={styles.indicator}
      >
        <BottomSheetView style={styles.contentContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>PRODUCTS</Text>
            <View style={styles.headerRight}>
              <TouchableOpacity
                style={styles.cartButton}
                onPress={handleGoToCart}
                disabled={isLoadingCart || cartItemsCount === 0}
              >
                <Feather name="shopping-cart" size={22} color="#64748b" />
                {cartItemsCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {cartItemsCount > 99 ? "99+" : cartItemsCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeButton}
              >
                <Feather name="x" size={24} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          {isAddingToCart && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#6b46c1" />
            </View>
          )}

          {products.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={products}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const productClassifications =
                  item?.product.productClassifications?.filter(
                    (classification) =>
                      classification.status === StatusEnum.ACTIVE
                  );
                const productClassification = getCheapestClassification(
                  item.product.productClassifications ?? []
                );
                const isActive =
                  productClassification?.status === StatusEnum.ACTIVE;
                const hasDiscount =
                  isActive && productClassification?.productDiscount;
                const hasPreOrder =
                  isActive && productClassification?.preOrderProduct;

                const currentPrice = calculateDiscountPrice(
                  productClassification?.price ?? 0,
                  item.discount,
                  DiscountTypeEnum.PERCENTAGE
                );
                const productTag = hasPreOrder
                  ? OrderEnum.PRE_ORDER
                  : hasDiscount
                  ? OrderEnum.FLASH_SALE
                  : item.product.status === ProductEnum.OFFICIAL
                  ? ""
                  : item.product.status;

                const mockProduct = {
                  id: item.product.id,
                  name: item.product.name,
                  tag: productTag,
                  price: productClassification?.price ?? -1,
                  currentPrice,
                  images: item.product.images,
                  deal: hasDiscount
                    ? productClassification?.productDiscount?.discount
                    : 0,
                  flashSale: hasDiscount
                    ? {
                        productAmount: (
                          productClassification?.productDiscount
                            ?.productClassifications ?? []
                        ).filter(
                          (classification) =>
                            classification?.status === StatusEnum.ACTIVE
                        )?.[0].quantity,
                        soldAmount: 65,
                      }
                    : null,
                  description: item.product.description,
                  detail: item.product.detail,
                  rating: Number(item.product.averageRating),
                  ratingAmount: Number(item.product.totalRatings),
                  soldInPastMonth: Number(item.product.salesLast30Days),
                  salesLast30Days: Number(item.product.salesLast30Days),
                  classifications: productClassifications,
                  certificates: item.product.certificates,
                  brand: item.product.brand,
                };
                return (
                  <ProductItem
                    product={mockProduct}
                    discount={item.discount}
                    originalPrice={item.product.price}
                    discountedPrice={currentPrice}
                    onAddToCart={() => handleAddToCart(mockProduct, item)}
                    onBuyNow={() => handleBuyNow(mockProduct, item)}
                  />
                );
              }}
              contentContainerStyle={styles.productsList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </BottomSheetView>
      </BottomSheet>

      {/* Classification Selection Bottom Sheet */}
      {selectedProduct && selectedLivestream && (
        <ProductClassificationBottomSheet
          visible={classificationSheetVisible}
          onClose={() => setClassificationSheetVisible(false)}
          productName={selectedProduct.name}
          classifications={selectedProduct.classifications || []}
          onAddToCart={handleAddToCartWithClassification}
          onBuyNow={handleBuyNowWithClassification}
          actionType={currentAction}
          livestreamDiscount={selectedLivestream.discount} // Pass the livestream discount
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  indicator: {
    width: 40,
    height: 4,
    backgroundColor: "#CBD5E1",
    alignSelf: "center",
    marginTop: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
    letterSpacing: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  cartButton: {
    padding: 8,
    marginRight: 8,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: "#6b46c1",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  productsList: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 8,
    maxWidth: "80%",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
});

// Add display name for React DevTools
ProductSelectionBottomSheet.displayName = "ProductSelectionBottomSheet";

export default ProductSelectionBottomSheet;
