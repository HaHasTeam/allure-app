import React from "react";
import { Alert, Keyboard, KeyboardAvoidingView, Platform } from "react-native";

import MyText from "@/components/common/MyText";

const ProductDetailScreen = () => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#FFF" }}
      keyboardVerticalOffset={100}
    >
      <MyText text="Update"></MyText>
    </KeyboardAvoidingView>
  );
};

export default ProductDetailScreen;
