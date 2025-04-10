import { useTranslation } from "react-i18next";

import { RequestStatusEnum, ShippingStatusEnum } from "@/types/enum";
import { IStatusTracking } from "@/types/status-tracking";

import { myTheme } from "@/constants";
import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  StatusTrackingIcon,
  StatusTrackingText,
} from "../status-tracking-order/StatusTrackingOrder";
import MyText from "../common/MyText";

interface OrderStatusTrackingProps {
  statusTrackingData: IStatusTracking[];
}
const OrderStatusTracking = ({
  statusTrackingData,
}: OrderStatusTrackingProps) => {
  const { t } = useTranslation();

  const defaultTimeline = [
    {
      status: "ORDER_CREATED",
      createdAt: statusTrackingData[0]?.createdAt,
      text: t("order.created"),
      icon: (
        <Feather name="package" size={18} color={myTheme.mutedForeground} />
      ),
    },
  ];

  const databaseTimeline = statusTrackingData.map((tracking) => ({
    status: tracking.status,
    createdAt: tracking.createdAt,
    text: StatusTrackingText(tracking.status),
    icon: StatusTrackingIcon(tracking.status),
  }));

  const defaultNextTimeline =
    statusTrackingData[statusTrackingData.length - 1]?.status ===
    ShippingStatusEnum.TO_PAY
      ? [
          {
            status: ShippingStatusEnum.WAIT_FOR_CONFIRMATION,
            text: StatusTrackingText(ShippingStatusEnum.WAIT_FOR_CONFIRMATION),
            icon: StatusTrackingIcon(ShippingStatusEnum.WAIT_FOR_CONFIRMATION),
            createdAt: "",
          },
          {
            status: ShippingStatusEnum.TO_SHIP,
            text: StatusTrackingText(ShippingStatusEnum.TO_SHIP),
            icon: StatusTrackingIcon(ShippingStatusEnum.TO_SHIP),
            createdAt: "",
          },
          {
            status: ShippingStatusEnum.SHIPPING,
            text: StatusTrackingText(ShippingStatusEnum.SHIPPING),
            icon: StatusTrackingIcon(ShippingStatusEnum.SHIPPING),
            createdAt: "",
          },
          {
            status: ShippingStatusEnum.COMPLETED,
            text: StatusTrackingText(ShippingStatusEnum.COMPLETED),
            icon: StatusTrackingIcon(ShippingStatusEnum.COMPLETED),
            createdAt: "",
          },
        ]
      : statusTrackingData[statusTrackingData.length - 1]?.status ===
        ShippingStatusEnum.WAIT_FOR_CONFIRMATION
      ? [
          {
            status: ShippingStatusEnum.TO_SHIP,
            text: StatusTrackingText(ShippingStatusEnum.TO_SHIP),
            icon: StatusTrackingIcon(ShippingStatusEnum.TO_SHIP),
            createdAt: "",
          },
          {
            status: ShippingStatusEnum.SHIPPING,
            text: StatusTrackingText(ShippingStatusEnum.SHIPPING),
            icon: StatusTrackingIcon(ShippingStatusEnum.SHIPPING),
            createdAt: "",
          },
          {
            status: ShippingStatusEnum.COMPLETED,
            text: StatusTrackingText(ShippingStatusEnum.COMPLETED),
            icon: StatusTrackingIcon(ShippingStatusEnum.COMPLETED),
            createdAt: "",
          },
        ]
      : statusTrackingData[statusTrackingData.length - 1]?.status ===
        ShippingStatusEnum.TO_SHIP
      ? [
          {
            status: ShippingStatusEnum.SHIPPING,
            text: StatusTrackingText(ShippingStatusEnum.SHIPPING),
            icon: StatusTrackingIcon(ShippingStatusEnum.SHIPPING),
            createdAt: "",
          },
          {
            status: ShippingStatusEnum.COMPLETED,
            text: StatusTrackingText(ShippingStatusEnum.COMPLETED),
            icon: StatusTrackingIcon(ShippingStatusEnum.COMPLETED),
            createdAt: "",
          },
        ]
      : statusTrackingData[statusTrackingData.length - 1]?.status ===
        ShippingStatusEnum.SHIPPING
      ? [
          {
            status: ShippingStatusEnum.COMPLETED,
            text: StatusTrackingText(ShippingStatusEnum.COMPLETED),
            icon: StatusTrackingIcon(ShippingStatusEnum.COMPLETED),
            createdAt: "",
          },
        ]
      : [];

  const timeline = [
    ...defaultTimeline,
    ...databaseTimeline,
    ...defaultNextTimeline,
  ];
  const currentStatus =
    statusTrackingData[statusTrackingData.length - 1]?.status;
  const currentIndex = timeline.findIndex(
    (step) => step.status === currentStatus
  );
  return (
    <View style={styles.container}>
      {timeline.length > 1 && (
        <View
          style={[
            styles.line,
            {
              left: `${100 / (timeline.length * 2)}%`,
              right: `${100 / (timeline.length * 2)}%`,
            },
          ]}
        />
      )}
      <View style={styles.timelineContainer}>
        {timeline.map((step, index) => {
          const isCurrent = index === currentIndex;
          const isCompleted = index < currentIndex;

          let iconBackgroundColor;
          let textColor;

          if (
            step.status === ShippingStatusEnum.CANCELLED ||
            step.status === RequestStatusEnum.APPROVED
          ) {
            iconBackgroundColor = myTheme.red[500];
            textColor = myTheme.red[500];
          } else if (step.status === ShippingStatusEnum.REFUNDED) {
            iconBackgroundColor = myTheme.gray[600];
            textColor = myTheme.gray[600];
          } else if (isCurrent || isCompleted) {
            iconBackgroundColor = myTheme.emerald[500];
            textColor = myTheme.emerald[500];
          } else {
            iconBackgroundColor = myTheme.muted;
            textColor = myTheme.mutedForeground;
          }

          return (
            <View
              key={index}
              style={[
                styles.timelineItem,
                {
                  maxWidth: `${100 / timeline.length}%`,
                },
              ]}
            >
              <View
                style={[
                  styles.timelineIcon,
                  {
                    backgroundColor: iconBackgroundColor,
                  },
                ]}
              >
                {step.icon}
              </View>

              <MyText
                text={step.text}
                styleProps={{
                  fontSize: 12,
                  textAlign: "center",
                  fontWeight: "500",
                  color: textColor,
                }}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    position: "relative",
  },
  line: {
    position: "absolute",
    top: 20,
    height: 2,
    backgroundColor: myTheme.muted,
  },
  timelineContainer: {
    width: "100%",
    position: "relative",
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timelineItem: {
    position: "relative",
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
});

export default OrderStatusTracking;
