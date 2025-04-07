import { useTranslation } from "react-i18next";

import { IBrand } from "@/types/brand";
import {
  ClassificationTypeEnum,
  ShippingStatusEnum,
  StatusEnum,
} from "@/types/enum";
import { IMasterConfig } from "@/types/master-config";
import { IOrderDetail } from "@/types/order";
import { IStatusTracking } from "@/types/status-tracking";

import ProductOrderDetailLandscape from "./ProductOrderDetailLandscape";
import { myTheme } from "@/constants";
import { hexToRgba } from "@/utils/color";
import { FlatList, StyleSheet, Text, View } from "react-native";

interface OrderDetailItemsProps {
  orderDetails: IOrderDetail[];
  status: ShippingStatusEnum;
  brand: IBrand | null;
  accountAvatar: string;
  accountName: string;
  statusTracking?: IStatusTracking[];
  masterConfig?: IMasterConfig[];
}
const OrderDetailItems = ({
  accountAvatar,
  accountName,
  orderDetails,
  status,
  brand,
  statusTracking,
  masterConfig,
}: OrderDetailItemsProps) => {
  const { t } = useTranslation();
  const renderItem = ({ item }: { item: IOrderDetail }) => (
    <ProductOrderDetailLandscape
      productImage={
        (item?.productClassification?.type === ClassificationTypeEnum.DEFAULT
          ? (
              item?.productClassification?.preOrderProduct ??
              item?.productClassification?.productDiscount ??
              item?.productClassification
            )?.product?.images?.filter(
              (img) => img?.status === StatusEnum.ACTIVE
            )[0]?.fileUrl
          : item?.productClassification?.images?.[0]?.fileUrl) ?? ""
      }
      productId={
        (
          item?.productClassification?.preOrderProduct ??
          item?.productClassification?.productDiscount ??
          item?.productClassification
        )?.product?.id ?? ""
      }
      productName={
        (
          item?.productClassification?.preOrderProduct ??
          item?.productClassification?.productDiscount ??
          item?.productClassification
        )?.product?.name ?? ""
      }
      eventType={item?.type ?? ""}
      unitPriceAfterDiscount={item?.unitPriceAfterDiscount}
      unitPriceBeforeDiscount={item?.unitPriceBeforeDiscount}
      subTotal={item?.subTotal}
      productQuantity={item?.quantity}
      productClassification={item?.productClassification}
      status={status}
      feedback={item?.feedback ?? null}
      orderDetailId={item?.id}
      brand={brand || null}
      accountAvatar={accountAvatar}
      accountName={accountName}
      masterConfig={masterConfig}
      statusTracking={statusTracking}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.headerText, { width: "16%" }]}>
          <Text>
            {t("orderDetail.products")} ({orderDetails?.length}{" "}
            {t("cart.products")})
          </Text>
        </View>
        <View style={[styles.headerSection, { width: "54%" }]}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ width: "40%" }} />
            <View style={{ width: "30%" }} />
            <View style={{ width: "25%", alignItems: "flex-end" }}>
              <Text>{t("orderDetail.price")}</Text>
            </View>
          </View>
        </View>
        <View style={[styles.quantity, { width: "12%" }]}>
          <Text>{t("orderDetail.quantity")}</Text>
        </View>
        <View style={[styles.subTotal, { width: "18%" }]}>
          <Text>{t("orderDetail.subTotal")}</Text>
        </View>
      </View>
      <View style={styles.content}>
        <FlatList
          data={orderDetails}
          renderItem={renderItem}
          keyExtractor={(item) =>
            `${item?.id}${item?.type}${
              (
                item?.productClassification?.preOrderProduct ??
                item?.productClassification?.productDiscount ??
                item?.productClassification
              )?.product?.id
            }`
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    gap: 8,
    padding: 8, // default for mobile, scales up for larger screens
    backgroundColor: hexToRgba(myTheme.secondary, 0.3),
    borderRadius: 4,
    color: myTheme.secondaryForeground,
  },
  headerText: {
    overflow: "visible",
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    justifyContent: "flex-start",
    fontSize: 12, // scales up with screen size
  },
  headerSection: {
    flexDirection: "column",
    gap: 8,
  },
  quantity: {
    alignItems: "center",
    justifyContent: "flex-end",
    fontSize: 12,
  },
  subTotal: {
    alignItems: "center",
    justifyContent: "flex-end",
    fontSize: 12,
  },
  content: {
    backgroundColor: myTheme.white,
    borderRadius: 8,
  },
});

export default OrderDetailItems;
