import React, { useEffect, useState, useCallback } from "react";

import { SafeAreaView } from "react-native-safe-area-context";

import MyText from "@/components/common/MyText";
import { myFontWeight } from "../../../constants/index";
import Empty from "@/components/empty";
import { useTranslation } from "react-i18next";

const CartScreen = () => {
  const { t } = useTranslation();
  // TODO: Fetch Cart Data from API

  return (
    <SafeAreaView>
      {/* Cart Header */}
      {/* Cart Item List */}
      {/* Cart Footer */}
      <Empty
        title={t("empty.cart.title")}
        description={t("empty.cart.description")}
        link={"/"}
        linkText={t("empty.cart.button")}
      />
    </SafeAreaView>
  );
};

export default CartScreen;
