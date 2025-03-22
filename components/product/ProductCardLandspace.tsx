import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, {
  useCallback,
  Dispatch,
  SetStateAction,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import { useTranslation } from "react-i18next";

import useHandleServerError from "@/hooks/useHandleServerError";
import { useToast } from "@/hooks/useToast";

import useCartStore from "@/store/cart";
import { ICartByBrand, ICartItem } from "@/types/cart";
import { IClassification } from "@/types/classification";
import {
  ClassificationTypeEnum,
  DiscountTypeEnum,
  ProductCartStatusEnum,
  ProductEnum,
} from "@/types/enum";
import { DiscountType } from "@/types/product-discount";
import { calculateDiscountPrice, calculateTotalPrice } from "@/utils/price";
import {
  checkCurrentProductClassificationActive,
  checkCurrentProductClassificationHide,
  hasActiveClassification,
  hasClassificationWithQuantity,
} from "@/utils/product";
import {
  deleteCartItemApi,
  getCartByIdApi,
  getMyCartApi,
  updateCartItemApi,
} from "@/hooks/api/cart";
import ProductTag from "./ProductTag";
import { Checkbox } from "react-native-ui-lib";
import { myTheme } from "@/constants";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import IncreaseDecreaseButton from "./IncreaseDecreaseButton";
import { Link } from "expo-router";
import AlertMessage from "../alert/AlertMessage";
import ImageWithFallback from "../image/ImageWithFallBack";

import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetView,
  TouchableWithoutFeedback,
} from "@gorhom/bottom-sheet";
import ClassificationChosen from "../product-classification/ClassificationChosen";
import Confirmation from "../confirmation/Confirmation";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Pressable } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Reanimated, {
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { hexToRgba } from "@/utils/color";

interface ProductCardLandscapeProps {
  cartItem: ICartItem;
  productImage: string;
  cartItemId: string;
  productId: string;
  productName: string;
  classifications: IClassification[];
  productClassification: IClassification | null;
  eventType: string;
  discountType?: DiscountType | null;
  discount?: number | null;
  price: number;
  productQuantity: number;
  productClassificationQuantity: number;
  isSelected: boolean;
  onChooseProduct: (cartItemId: string) => void;
  setIsTriggerTotal: Dispatch<SetStateAction<boolean>>;
  productStatus?: ProductEnum;
}

const ProductCardLandscape = ({
  cartItem,
  productImage,
  cartItemId,
  productId,
  productName,
  classifications,
  discount,
  discountType,
  eventType,
  price,
  isSelected,
  onChooseProduct,
  productQuantity,
  productClassification,
  productClassificationQuantity,
  setIsTriggerTotal,
  productStatus,
}: ProductCardLandscapeProps) => {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(productQuantity);
  const [inputValue, setInputValue] = useState(
    productQuantity.toString() ?? ""
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { successToast, errorToast } = useToast();
  const { cartItems, setCartItems, selectedCartItem, setSelectedCartItem } =
    useCartStore();
  const handleServerError = useHandleServerError();
  const queryClient = useQueryClient();
  // bottom sheet for delete cart items
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const toggleModalVisibility = () => {
    if (isModalVisible) {
      bottomSheetModalRef.current?.close(); // Close modal if it's visible
    } else {
      bottomSheetModalRef.current?.present(); // Open modal if it's not visible
    }
    setIsModalVisible(!isModalVisible); // Toggle the state
  };

  const PRODUCT_STOCK_COUNT = productClassification?.quantity ?? 0;
  const MAX_QUANTITY_IN_CART = productClassificationQuantity;
  const OUT_OF_STOCK = PRODUCT_STOCK_COUNT <= 0;
  const HIDDEN = checkCurrentProductClassificationHide(
    productClassification,
    classifications
  );
  const IS_ACTIVE = checkCurrentProductClassificationActive(
    productClassification,
    classifications
  );

  const { mutateAsync: deleteCartItemFn } = useMutation({
    mutationKey: [deleteCartItemApi.mutationKey, cartItemId as string],
    mutationFn: deleteCartItemApi.fn,
    onSuccess: () => {
      successToast({
        message: t("delete.productCart.success"),
      });
      queryClient.invalidateQueries({
        queryKey: [getMyCartApi.queryKey],
      });
      queryClient.invalidateQueries({
        queryKey: [getCartByIdApi.queryKey, cartItemId as string],
      });
    },
  });

  const { mutateAsync: updateCartItemFn } = useMutation({
    mutationKey: [updateCartItemApi.mutationKey],
    mutationFn: updateCartItemApi.fn,
    onSuccess: () => {
      // queryClient.invalidateQueries({
      //   queryKey: [getMyCartApi.queryKey],
      // })
      // queryClient.invalidateQueries({
      //   queryKey: [getCartByIdApi.queryKey, cartItemId as string],
      // })
      // console.log(productQuantity, quantity, inputValue)

      setIsTriggerTotal((prev) => !prev);
    },
  });

  const handleQuantityUpdate = useCallback(
    async (newQuantity: number) => {
      if (isProcessing) return;
      setIsProcessing(true);
      setQuantity(newQuantity);
      setInputValue(newQuantity.toString());
      try {
        await updateCartItemFn({
          id: cartItem?.id ?? "",
          quantity: newQuantity,
        });
        // Update Zustand store
        const updatedCartItems: ICartByBrand = { ...selectedCartItem };

        for (const brandId in updatedCartItems) {
          if (updatedCartItems[brandId]) {
            updatedCartItems[brandId] = updatedCartItems[brandId].map(
              (item) => {
                if (item.id === cartItem?.id) {
                  return { ...item, quantity: newQuantity };
                }
                return item;
              }
            );
          }
        }

        const newCartItems: ICartByBrand = { ...cartItems };
        for (const brandId in newCartItems) {
          if (newCartItems[brandId]) {
            newCartItems[brandId] = newCartItems[brandId].map((item) => {
              if (item.id === cartItem?.id) {
                return { ...item, quantity: newQuantity };
              }
              return item;
            });
          }
        }
        setSelectedCartItem(updatedCartItems);
        setCartItems(newCartItems);
      } catch (error) {
        handleServerError({ error });
      } finally {
        setIsProcessing(false);
      }
    },
    [
      isProcessing,
      updateCartItemFn,
      cartItem?.id,
      selectedCartItem,
      cartItems,
      setSelectedCartItem,
      setCartItems,
      handleServerError,
    ]
  );
  console.log(selectedCartItem);
  const handleDeleteCartItem = async () => {
    try {
      await deleteCartItemFn(cartItemId);
    } catch (error) {
      handleServerError({ error });
    }
  };

  const decreaseQuantity = () => {
    if (quantity === 1) {
      toggleModalVisibility();
    }
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      setInputValue(newQuantity.toString());
      handleQuantityUpdate(newQuantity);
    }
  };

  const increaseQuantity = () => {
    if (quantity < MAX_QUANTITY_IN_CART) {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      setInputValue(newQuantity.toString());
      handleQuantityUpdate(newQuantity);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow clearing the input
    if (value === "") {
      setInputValue("");
      setQuantity(1);
      return;
    }

    // Allow only valid positive integers
    if (/^\d+$/.test(value)) {
      const parsedValue = parseInt(value, 10);

      if (parsedValue > 0 && parsedValue <= MAX_QUANTITY_IN_CART) {
        setInputValue(value);
        setQuantity(parsedValue);
      } else if (parsedValue > MAX_QUANTITY_IN_CART) {
        errorToast({
          message: t("cart.maxQuantityError", {
            maxQuantity: MAX_QUANTITY_IN_CART,
          }),
          isShowDescription: false,
        });
      } else if (parsedValue <= 0) {
        errorToast({
          message: t("cart.negativeQuantityError"),
          isShowDescription: false,
        });
      }
    }
  };

  const handleBlur = () => {
    const newQuantity = parseInt(inputValue, 10) || productQuantity;
    setQuantity(newQuantity);
    handleQuantityUpdate(newQuantity);
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const newQuantity = parseInt(inputValue, 10) || productQuantity;
      setQuantity(newQuantity);
      handleQuantityUpdate(newQuantity);
    }
  };

  const totalPrice = calculateTotalPrice(
    price,
    quantity,
    discount,
    discountType
  );
  const discountPrice = calculateDiscountPrice(price, discount, discountType);
  const HAS_ACTIVE_CLASSIFICATION = hasActiveClassification(classifications);
  const IN_STOCK_CLASSIFICATION =
    hasClassificationWithQuantity(classifications);

  const PREVENT_ACTION =
    !HAS_ACTIVE_CLASSIFICATION ||
    !IN_STOCK_CLASSIFICATION ||
    !(
      productStatus === ProductEnum.FLASH_SALE ||
      productStatus === ProductEnum.OFFICIAL
    );

  useEffect(() => {
    setQuantity(productQuantity);
    setInputValue(productQuantity.toString());
  }, [productQuantity]);
  console.log(productImage);

  // Render right action (trash button) when swiped
  // const renderRightActions = (progress, dragX) => {
  //   return (
  //     <Pressable
  //       style={styles.deleteAction}
  //       onPress={() => {
  //         swipeableRef.current?.close();
  //         toggleModalVisibility();
  //       }}
  //     >
  //       <Feather name="trash-2" size={24} color="white" />
  //     </Pressable>
  //   );
  // };
  function RightAction(prog: SharedValue<number>, drag: SharedValue<number>) {
    const styleAnimation = useAnimatedStyle(() => {
      return {
        transform: [{ translateX: drag.value + 50 }],
      };
    });

    return (
      <Reanimated.View style={styleAnimation}>
        <Pressable
          style={styles.deleteAction}
          onPress={() => {
            toggleModalVisibility();
          }}
        >
          <Feather name="trash-2" size={24} color="white" />
        </Pressable>
      </Reanimated.View>
    );
  }
  return (
    <GestureHandlerRootView>
      <ReanimatedSwipeable
        containerStyle={styles.swipeable}
        friction={2}
        enableTrackpadTwoFingerGesture
        rightThreshold={40}
        renderRightActions={RightAction}
      >
        <View style={styles.container}>
          <View style={styles.childContainer}>
            <View style={styles.firstChild}>
              {/* product label */}
              <View
                style={[PREVENT_ACTION && styles.opacity, styles.commonFlex]}
              >
                {/* checkbox or text show hidden, inactive */}
                {productStatus === ProductEnum.BANNED ? (
                  <ProductTag tag={ProductCartStatusEnum.BANNED} />
                ) : productStatus === ProductEnum.INACTIVE ? (
                  <ProductTag tag={ProductCartStatusEnum.INACTIVE} />
                ) : productStatus === ProductEnum.UN_PUBLISHED ? (
                  <ProductTag tag={ProductCartStatusEnum.UN_PUBLISHED} />
                ) : productStatus === ProductEnum.OUT_OF_STOCK ? (
                  <ProductTag tag={ProductCartStatusEnum.SOLD_OUT} />
                ) : IS_ACTIVE ? (
                  <Checkbox
                    size={20}
                    id={cartItemId}
                    value={isSelected}
                    style={styles.checkbox}
                    color={myTheme.primary}
                    onValueChange={() => onChooseProduct(cartItemId)}
                  />
                ) : HIDDEN ? (
                  <ProductTag tag={ProductCartStatusEnum.HIDDEN} />
                ) : OUT_OF_STOCK ? (
                  <ProductTag tag={ProductCartStatusEnum.SOLD_OUT} />
                ) : IN_STOCK_CLASSIFICATION ? (
                  <ProductTag tag={ProductCartStatusEnum.SOLD_OUT} />
                ) : null}

                {/* product image */}
                <Link
                  href={{
                    pathname: "/(app)/(products)/[id]",
                    params: { id: productId },
                  }}
                >
                  <View style={styles.productImgContainer}>
                    <ImageWithFallback
                      src={productImage}
                      alt={productName}
                      resizeMode="cover"
                      style={styles.image}
                    />
                  </View>
                </Link>
              </View>

              {/* product name, classification, price */}
              <View
                style={[
                  PREVENT_ACTION && styles.opacity,
                  styles.nameClassPriceContainer,
                ]}
              >
                {/* product name */}
                <View style={[styles.commonFlex, styles.fullWidth]}>
                  <View style={[styles.nameContainer, styles.fullWidth]}>
                    <Link
                      href={{
                        pathname: "/(app)/(products)/[id]",
                        params: { id: productId },
                      }}
                      style={styles.linkStyle}
                    >
                      <Text
                        numberOfLines={2}
                        ellipsizeMode="tail"
                        style={styles.overFlowText}
                      >
                        {productName}
                      </Text>
                    </Link>
                    <View>
                      {eventType && eventType !== "" ? (
                        <ProductTag tag={eventType} size="small" />
                      ) : null}
                    </View>
                    {productStatus === ProductEnum.BANNED ? (
                      <AlertMessage
                        style={[styles.alertMessage, styles.danger]}
                        textSize="small"
                        color="danger"
                        text="danger"
                        message={t("cart.bannedMessage")}
                      />
                    ) : productStatus === ProductEnum.INACTIVE ? (
                      <AlertMessage
                        style={[styles.alertMessage, styles.hidden]}
                        textSize="small"
                        color="black"
                        message={t("cart.inactiveMessage")}
                      />
                    ) : productStatus === ProductEnum.UN_PUBLISHED ? (
                      <AlertMessage
                        style={[styles.alertMessage, styles.danger]}
                        textSize="small"
                        color="danger"
                        text="danger"
                        message={t("cart.unPublishMessage")}
                      />
                    ) : productStatus === ProductEnum.OUT_OF_STOCK ? (
                      <AlertMessage
                        style={[styles.alertMessage, styles.danger]}
                        textSize="small"
                        color="danger"
                        text="danger"
                        message={t("cart.soldOutAllMessage")}
                      />
                    ) : HIDDEN ? (
                      <AlertMessage
                        style={[styles.alertMessage, styles.hidden]}
                        textSize="small"
                        color="black"
                        message={t("cart.hiddenMessage")}
                      />
                    ) : !IN_STOCK_CLASSIFICATION ? (
                      <AlertMessage
                        style={[styles.alertMessage, styles.danger]}
                        textSize="small"
                        color="danger"
                        text="danger"
                        message={t("cart.soldOutAllMessage")}
                      />
                    ) : OUT_OF_STOCK ? (
                      <AlertMessage
                        style={[styles.alertMessage, styles.danger]}
                        textSize="small"
                        color="danger"
                        text="danger"
                        message={t("cart.soldOutMessage")}
                      />
                    ) : null}
                  </View>
                </View>
                {/* product classification */}
                <View style={styles.commonFlex}>
                  {productClassification?.type ===
                    ClassificationTypeEnum?.CUSTOM && (
                    <ClassificationChosen
                      classifications={classifications}
                      productClassification={productClassification}
                      cartItemId={cartItemId}
                      cartItemQuantity={quantity}
                      preventAction={PREVENT_ACTION}
                    />
                  )}
                </View>
                {/* price & quantity */}
                <View
                  style={[
                    styles.commonFlex,
                    styles.justifyBetween,
                    styles.priceQuantityContainer,
                  ]}
                >
                  {/* product price */}
                  {discount &&
                  discount > 0 &&
                  (discountType === DiscountTypeEnum.AMOUNT ||
                    discountType === DiscountTypeEnum.PERCENTAGE) ? (
                    <View style={styles.haftWidth}>
                      <View style={styles.commonFlex}>
                        <Text style={styles.highlighText}>
                          {t("productCard.currentPrice", {
                            price: discountPrice,
                          })}
                        </Text>
                        <Text style={styles.disabled}>
                          {t("productCard.price", { price: price })}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.highlighText}>
                          {t("voucher.off.numberPercentage", {
                            percentage: discount * 100,
                          })}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={[styles.commonFlex, styles.haftWidth]}>
                      <Text>{t("productCard.price", { price: price })}</Text>
                    </View>
                  )}

                  {/* product quantity */}
                  <View
                    style={[PREVENT_ACTION && styles.opacity, styles.haftWidth]}
                  >
                    {IS_ACTIVE &&
                    (productStatus === ProductEnum.OFFICIAL ||
                      productStatus === ProductEnum.FLASH_SALE) ? (
                      <IncreaseDecreaseButton
                        onIncrease={increaseQuantity}
                        onDecrease={decreaseQuantity}
                        isIncreaseDisabled={quantity >= MAX_QUANTITY_IN_CART}
                        isDecreaseDisabled={false}
                        inputValue={inputValue}
                        handleInputChange={handleInputChange}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        isProcessing={isProcessing}
                      />
                    ) : (
                      <Text>1</Text>
                    )}
                  </View>
                </View>
                <View
                  style={[PREVENT_ACTION && styles.opacity, styles.secondChild]}
                >
                  {(PRODUCT_STOCK_COUNT < quantity ||
                    PRODUCT_STOCK_COUNT <= 0) && (
                    <Text
                      style={[
                        PRODUCT_STOCK_COUNT <= 0
                          ? styles.outOfStockText
                          : styles.almostOutText,
                        styles.textSm,
                      ]}
                    >
                      {t("cart.productLeft", { count: PRODUCT_STOCK_COUNT })}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* product total price */}
            {/* <Text style={[styles.textPrice, PREVENT_ACTION && styles.opacity ]}
          className={`text-red-500 lg:text-base md:text-sm sm:text-xs text-xs w-[16%] md:w-[8%] sm:w-[12%] flex flex-col items-center ${
            
          }`}
        >
          {t("productCard.currentPrice", { price: totalPrice })}
        </Text> */}

            {/* delete action */}
            {/* <View style={styles.trashContainer}>
          <Feather
            name="trash-2"
            size={24}
            style={styles.trashIcon}
            onClick={() => {
              toggleModalVisibility();
            }}
          />
        </View> */}
          </View>
          <Confirmation
            action="delete"
            setIsModalVisible={setIsModalVisible}
            bottomSheetModalRef={bottomSheetModalRef}
            toggleModalVisibility={toggleModalVisibility}
            onConfirm={() => {
              // Handle delete confirmation
              handleDeleteCartItem();
              setIsModalVisible(false);
            }}
            item="productCart"
          />
        </View>
      </ReanimatedSwipeable>
    </GestureHandlerRootView>
  );
};

export default ProductCardLandscape;

const styles = StyleSheet.create({
  deleteAction: {
    width: 50,
    backgroundColor: myTheme.destructive,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  separator: {
    width: "100%",
    borderTopWidth: 1,
  },
  swipeable: {
    // height: 50,
    // backgroundColor: hexToRgba(myTheme.accent, 0.3),
    // alignItems: "center",
  },
  textSm: { fontSize: 12 },
  priceQuantityContainer: { width: "100%" },
  haftWidth: { width: "50%" },
  justifyBetween: {
    justifyContent: "space-between",
  },
  linkStyle: { maxWidth: "100%", flexShrink: 1, fontSize: 12 },
  disabled: { color: myTheme.gray[400] },
  highlighText: { color: myTheme.red[500] },
  nameContainer: {
    marginLeft: 1,
    gap: 1,
    flexDirection: "column",
  },
  secondChild: {
    width: "100%",
  },
  image: {
    borderRadius: 4,
    width: "100%",
    height: "100%",
  },
  overFlowText: {
    flexShrink: 1,
    flexWrap: "wrap",
    maxWidth: "100%",
  },
  nameClassPriceContainer: {
    flexDirection: "column",
    gap: 2,
    paddingHorizontal: 2,
    width: "75%",
  },
  productImgContainer: {
    width: 60,
    height: 60,
  },
  fullWidth: { width: "100%" },
  commonFlex: { flexDirection: "row", gap: 4, alignItems: "center" },
  container: {
    width: "100%",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: myTheme.gray[200],
    paddingHorizontal: 10,
  },
  firstChild: {
    width: "100%",
    flex: 1,
    flexDirection: "row",
    gap: 2,
  },
  childContainer: {
    width: "100%",
    flexDirection: "column",
    gap: 2,
    justifyContent: "center",
  },
  hidden: {
    backgroundColor: myTheme.gray[200],
  },
  danger: {
    backgroundColor: myTheme.red[50],
  },
  alertMessage: {
    borderWidth: 0,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  almostOutText: {
    color: myTheme.orange[500],
    fontSize: 14,
  },
  outOfStockText: {
    color: myTheme.red[500],
    fontSize: 14,
  },
  textPrice: {
    color: myTheme.red[500],
    fontWeight: "500",
    fontSize: 14,
    marginLeft: 5,
  },
  checkbox: {
    alignSelf: "center",
    borderRadius: 6,
  },
  trashContainer: {
    width: "7%",
    justifyContent: "center",
    flexDirection: "row",
  },
  trashIcon: {
    color: myTheme.red[500],
  },
  opacity: {
    opacity: 0.4,
  },
});
