import { useRef, useState } from "react";
import { UseFormSetValue } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { IAddress } from "@/types/address";
import { AddressEnum } from "@/types/enum";

import AlertMessage from "../alert/AlertMessage";
import AddressListDialog from "./AddressListBottomSheet";
import { CreateOrderSchema } from "@/schema/order.schema";
import { TouchableOpacity, View } from "react-native";
import { Text } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { myTheme } from "@/constants";
import { hexToRgba } from "@/utils/color";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import AddressListBottomSheet from "./AddressListBottomSheet";

interface AddressSectionProps {
  setValue: UseFormSetValue<z.infer<typeof CreateOrderSchema>>;
  addresses: IAddress[];
}
export default function AddressSection({
  addresses,
  setValue,
}: AddressSectionProps) {
  const { t } = useTranslation();
  const defaultAddress =
    addresses?.find((address) => address.isDefault === true) ?? null;

  const [chosenAddress, setChosenAddress] = useState<IAddress | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const toggleModalVisibility = () => {
    if (isVisible) {
      bottomSheetModalRef.current?.close(); // Close modal if it's visible
    } else {
      bottomSheetModalRef.current?.present(); // Open modal if it's not visible
    }
    setIsVisible(!isVisible); // Toggle the state
  };
  return (
    <View
      style={{
        width: "100%",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        backgroundColor: myTheme.white,
        borderRadius: 8,
        padding: 16,
      }}
    >
      <View style={{ width: "100%", marginBottom: 8 }}>
        {/* Delivery Section */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <MaterialCommunityIcons
              name="map-marker-check"
              size={20}
              color={myTheme.mutedForeground}
            />
            <Text style={{ fontSize: 18, color: myTheme.mutedForeground }}>
              {t("address.deliveryTo")}
            </Text>
          </View>
          <TouchableOpacity onPress={() => toggleModalVisibility()}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialCommunityIcons
                name="pencil"
                size={16}
                color={myTheme.blue[500]}
              />
              <Text style={{ color: myTheme.blue[500] }}>
                {t("address.edit")}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        {chosenAddress ? (
          <View style={{ marginTop: 8 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Text
                style={{
                  fontWeight: "500",
                  paddingRight: 8,
                  borderRightWidth: 1,
                  borderRightColor: myTheme.gray[300],
                }}
              >
                {chosenAddress?.fullName}
              </Text>
              <Text style={{ fontWeight: "500" }}>{chosenAddress?.phone}</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 6 }}>
              <View style={{ marginTop: 4, width: "20%" }}>
                {chosenAddress?.type && (
                  <View
                    style={{
                      backgroundColor: hexToRgba(myTheme.green[100], 0.5),
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      borderRadius: 4,
                    }}
                  >
                    <Text
                      style={{
                        color: myTheme.green[700],
                        fontSize: 12,
                        textTransform: "uppercase",
                      }}
                    >
                      {chosenAddress?.type === AddressEnum.HOME &&
                        t("address.addressTypeValueHome")}
                      {chosenAddress?.type === AddressEnum.OFFICE &&
                        t("address.addressTypeValueOffice")}
                      {chosenAddress?.type === AddressEnum.OTHER &&
                        t("address.addressTypeValueOther")}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={{ color: myTheme.mutedForeground, width: "80%" }}>
                {chosenAddress?.fullAddress}
              </Text>
            </View>
          </View>
        ) : (
          <AlertMessage
            message={t("address.alertMessage", { action: "checkout" })}
          />
        )}
      </View>
      <AddressListBottomSheet
        addresses={addresses}
        defaultAddress={defaultAddress}
        setChosenAddress={setChosenAddress}
        bottomSheetModalRef={bottomSheetModalRef}
        setIsModalVisible={setIsVisible}
        setValue={setValue}
        toggleModalVisibility={toggleModalVisibility}
        isModalVisibility={isVisible}
      />
    </View>
  );
}
