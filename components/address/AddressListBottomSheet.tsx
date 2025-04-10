import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { UseFormReturn, UseFormSetValue } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { IAddress } from "@/types/address";

import AddAddressBottomSheet from "./AddAddressBottomSheet";
import AddressItem from "./AddressItem";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
  TouchableWithoutFeedback,
} from "@gorhom/bottom-sheet";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { myTheme } from "@/constants";
import { hexToRgba } from "@/utils/color";
import { CreateOrderSchema } from "@/schema/order.schema";
import { AntDesign } from "@expo/vector-icons";
import Empty from "../empty";

interface AddressListBottomSheetProps {
  addresses?: IAddress[];
  chosenAddress?: IAddress | null;
  defaultAddress?: IAddress | null;
  setChosenAddress?: Dispatch<SetStateAction<IAddress | null>>;
  setIsModalVisible: Dispatch<SetStateAction<boolean>>;
  bottomSheetModalRef: React.RefObject<BottomSheetModal>;
  setValue: UseFormSetValue<z.infer<typeof CreateOrderSchema>>;
  toggleModalVisibility: () => void;
  isModalVisibility: boolean;
}
export default function AddressListBottomSheet({
  addresses,
  chosenAddress,
  defaultAddress,
  setChosenAddress,
  setIsModalVisible,
  bottomSheetModalRef,
  setValue,
  toggleModalVisibility,
  isModalVisibility,
}: AddressListBottomSheetProps) {
  const { t } = useTranslation();
  const [isAddVisible, setIsAddVisible] = useState(false);

  const bottomSheetAddModalRef = useRef<BottomSheetModal>(null);
  const toggleModalAddVisibility = () => {
    if (isAddVisible) {
      bottomSheetAddModalRef.current?.close(); // Close modal if it's visible
    } else {
      bottomSheetAddModalRef.current?.present(); // Open modal if it's not visible
    }
    setIsAddVisible(!isAddVisible); // Toggle the state
  };
  const snapPoints = useMemo(() => ["60%", "100%"], []);
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        opacity={0.9}
        onPress={() => bottomSheetModalRef.current?.close()}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    []
  );

  const [selectedAddressId, setSelectedAddress] = useState(
    defaultAddress?.id ?? ""
  );

  const handleAddressSelection = (addressId?: string) => {
    if (addressId) {
      setSelectedAddress(addressId);
    }
  };
  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);
  const handleModalDismiss = () => {
    bottomSheetModalRef.current?.close();
    setIsModalVisible(false);
  };

  const handleConfirm = () => {
    if (selectedAddressId) {
      setValue("addressId", selectedAddressId);
      const customChosenAddress =
        addresses?.find((address) => address.id === selectedAddressId) ?? null;
      setChosenAddress?.(customChosenAddress);
    }
    toggleModalVisibility(); // Close the dialog
  };

  useEffect(() => {
    if (!chosenAddress && defaultAddress) {
      setSelectedAddress(defaultAddress?.id ?? "");
      setChosenAddress?.(defaultAddress);
      setValue("addressId", defaultAddress?.id ?? "");
    }
  }, [addresses, defaultAddress, chosenAddress, setChosenAddress]);

  const renderAddressItem = ({ item: address }: { item: IAddress }) => (
    <View style={styles.addressItemContainer}>
      <AddressItem
        handleAddressSelection={handleAddressSelection}
        address={address}
        selectedAddressId={selectedAddressId}
      />
    </View>
  );
  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      onDismiss={handleModalDismiss}
      backdropComponent={renderBackdrop}
    >
      <TouchableWithoutFeedback onPress={handleModalDismiss}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      <BottomSheetView style={styles.contentContainer}>
        <Text style={styles.title}>{t("address.chooseAddress")}</Text>
        <TouchableOpacity
          onPress={() => toggleModalAddVisibility()}
          style={[
            styles.button,
            {
              borderColor: myTheme.primary,
              backgroundColor: hexToRgba(myTheme.primary, 0.15),
              gap: 4,
              alignItems: "center",
            },
          ]}
        >
          <AntDesign name="pluscircleo" color={myTheme.primary} size={16} />
          <Text style={{ color: myTheme.primary }}>
            {t("address.addNewAddress")}
          </Text>
        </TouchableOpacity>
        <AddAddressBottomSheet
          bottomSheetModalRef={bottomSheetAddModalRef}
          setIsModalVisible={setIsAddVisible}
          toggleModalVisibility={toggleModalAddVisibility}
        />

        <View style={styles.listContainer}>
          {addresses && addresses.length > 0 ? (
            <FlatList
              data={addresses}
              renderItem={renderAddressItem}
              keyExtractor={(address, index) =>
                address.id || `address-${index}`
              }
              contentContainerStyle={styles.flatListContent}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Empty
              title={t("empty.address.title")}
              description={t("empty.address.description")}
            />
          )}
        </View>
        <View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.outlineButton]}
              onPress={() => toggleModalVisibility()}
            >
              <Text style={styles.outlineBtnText}>{t("dialog.cancel")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                handleConfirm();
              }}
            >
              <Text style={styles.buttonText}>{t("dialog.ok")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  outlineBtnText: {
    color: myTheme.primary,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  contentContainer: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 25,
  },
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    zIndex: 1,
  },
  listContainer: {
    marginVertical: 10,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  addressItemContainer: {
    width: "100%",
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: myTheme.primary,
    borderColor: myTheme.primary,
  },
  outlineButton: {
    backgroundColor: "transparent",
    borderColor: myTheme.primary,
  },
  buttonText: {
    color: myTheme.white,
    fontWeight: "bold",
  },
});
