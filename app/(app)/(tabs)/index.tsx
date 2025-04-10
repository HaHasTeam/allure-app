import "@/i18n/i18n";

import { Feather } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LoaderScreen, TextField, View } from "react-native-ui-lib";

import MyLink from "@/components/common/MyLink";
import MyText from "@/components/common/MyText";
import HomeBanner from "@/components/home/HomeBanner";
import BeautyOffers from "@/components/home/BeautyOffers";
import FlashSale from "@/components/home/FlashSale";
import RecommendProduct from "@/components/home/RecommendProduct";
import PreOrderProductSections from "@/components/home/PreOrderProductSection";

interface IHomeLayout {
  title: string;
  learnMoreLink: Href;
  component: React.JSX.Element;
}

export default function HomeScreen() {
  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1, backgroundColor: "#FFF" }}
          keyboardVerticalOffset={100}
        >
          <FlatList
            data={[]}
            renderItem={() => null}
            ListHeaderComponent={
              <>
                <HomeBanner />
                <BeautyOffers />
                <FlashSale />
                <PreOrderProductSections />
                <RecommendProduct />
              </>
            }
            keyExtractor={(item, index) => index.toString()}
          />
        </KeyboardAvoidingView>
      </GestureHandlerRootView>
    </>
  );
}
