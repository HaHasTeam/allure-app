import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { IPreOrder } from "@/types/pre-order";
import { formatDate } from "@/utils";
import { Countdown } from "../countDown/CountDown";
import { Entypo } from "@expo/vector-icons";
import { myTheme } from "@/constants";
import ProductTag from "./ProductTag";

interface ProductCardProps {
  preOrderProduct: IPreOrder;
}
function PreOrderProductCard({ preOrderProduct }: ProductCardProps) {
  const [timeStatus, setTimeStatus] = useState("upcoming");
  const [releaseDay, setReleaseDay] = useState(new Date());
  const router = useRouter();

  useEffect(() => {
    const checkTimeStatus = () => {
      const now = new Date();
      const release = new Date(preOrderProduct.startTime);
      const end = new Date(preOrderProduct.endTime);
      setReleaseDay(release);

      if (now < release) {
        setTimeStatus("upcoming");
      } else if (now >= release && now < end) {
        setTimeStatus("ongoing");
      } else {
        setTimeStatus("ended");
      }
    };

    checkTimeStatus();
  }, [preOrderProduct.startTime, preOrderProduct.endTime]);

  const renderDateInfo = () => {
    switch (timeStatus) {
      case "upcoming":
        return (
          <View style={styles.dateInfoContainer}>
            <Text style={styles.textSmall}>Dự kiến ra mắt:</Text>
            <Text style={styles.textBold}>
              {releaseDay.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
            <Text style={styles.textBold}>
              {formatDate(preOrderProduct.startTime, "en-GB", {
                month: "numeric",
              })}
            </Text>
          </View>
        );
      case "ongoing":
        return (
          <View style={styles.dateInfoContainer}>
            <Text style={styles.textSmall}>Ngày kết thúc:</Text>
            <Text style={styles.textBold}>
              {new Date(preOrderProduct.endTime).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
            <Text style={styles.textBold}>
              {formatDate(preOrderProduct.endTime, "en-GB", {
                month: "numeric",
              })}
            </Text>
          </View>
        );
      case "ended":
        return null;
    }
  };

  const renderButton = () => {
    if (timeStatus === "upcoming") {
      return (
        <View style={styles.buttonContainer}>
          <Countdown targetDate={releaseDay.toISOString()} language="vi" />
          <TouchableOpacity style={styles.button}>
            <Entypo
              name="chevron-right"
              size={16}
              color="#fff"
              style={styles.icon}
            />
            <Text style={styles.buttonText}>Tìm Hiểu thêm</Text>
          </TouchableOpacity>
        </View>
      );
    } else if (timeStatus === "ongoing") {
      return (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: myTheme.amber[500] }]}
        >
          <Text style={styles.buttonText}>Đặt Trước</Text>
        </TouchableOpacity>
      );
    }
    return null;
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/products/${preOrderProduct.product.id}`)}
    >
      <View style={styles.tagContainer}>
        <ProductTag tag={timeStatus === "ongoing" ? "ACTIVE" : "WAITING"} />
      </View>
      <View style={styles.cardContent}>
        <Image
          source={{
            uri:
              preOrderProduct.productClassifications[0]?.images[0]?.fileUrl ||
              "/placeholder.svg",
          }}
          style={styles.image}
        />
        <View style={styles.infoContainer}>
          <Text style={styles.productName}>{preOrderProduct.product.name}</Text>
          <View style={styles.dateInfoWrapper}>{renderDateInfo()}</View>
          <View style={styles.buttonWrapper}>{renderButton()}</View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  dateInfoWrapper: {
    marginBottom: 10,
  },
  buttonWrapper: {
    alignItems: "center",
  },
  card: {
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
    elevation: 3,
    marginBottom: 10,
  },
  tagContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
  },
  cardContent: {
    flexDirection: "column",
  },
  image: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  infoContainer: {
    padding: 10,
    flexDirection: "column",
  },
  productName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  dateInfoContainer: {
    alignItems: "center",
  },
  textSmall: {
    fontSize: 12,
    color: "#666",
  },
  textBold: {
    fontSize: 14,
    fontWeight: "bold",
  },
  buttonContainer: {
    alignItems: "center",
    marginTop: 10,
  },
  button: {
    backgroundColor: myTheme.primary,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  icon: {
    marginRight: 5,
  },
});

export default PreOrderProductCard;
