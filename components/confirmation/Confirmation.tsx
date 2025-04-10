import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { Dispatch, SetStateAction, useCallback, useMemo } from "react";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
  TouchableWithoutFeedback,
} from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";
import { myTheme } from "@/constants";
import { Ionicons } from "@expo/vector-icons";

interface ConfirmationProps {
  setIsModalVisible: Dispatch<SetStateAction<boolean>>;
  toggleModalVisibility: () => void;
  bottomSheetModalRef: React.RefObject<BottomSheetModal>;
  item: string;
  action: "delete";
  onConfirm: () => void;
  title?: string;
  description?: string;
}

const Confirmation = ({
  setIsModalVisible,
  toggleModalVisibility,
  bottomSheetModalRef,
  item,
  action,
  onConfirm,
  title,
  description,
}: ConfirmationProps) => {
  const { t } = useTranslation();
  // bottom sheet for classification
  const snapPoints = useMemo(() => ["26%", "30%", "50%", "60%", "100%"], []);
  const renderBackdrop = React.useCallback(
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

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);
  const handleModalDismiss = () => {
    bottomSheetModalRef.current?.close();
    setIsModalVisible(false);
  };

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
        <View>
          <View style={styles.iconContentContainer}>
            <View
              style={[
                styles.iconContainer,
                action === "delete" && styles.iconDanger,
              ]}
            >
              <Ionicons
                name="alert-circle"
                size={24}
                color={action === "delete" ? myTheme.red[500] : myTheme.black}
              />
            </View>
            <View style={styles.textContentContainer}>
              <Text
                style={[styles.title, action === "delete" && styles.dangerText]}
              >
                {title ?? t(`${action}.${item}.title`)}
              </Text>
              <Text style={styles.description}>
                {description ?? t(`${action}.${item}.description`)}
              </Text>
            </View>
          </View>
        </View>
        <View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                action === "delete" && styles.dangerOutline,
              ]}
              onPress={() => toggleModalVisibility()}
            >
              <Text
                style={[
                  styles.buttonText,
                  action === "delete" && styles.dangerText,
                ]}
              >
                {t(`${action}.${item}.cancel`)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, action === "delete" && styles.danger]}
              onPress={() => onConfirm()}
            >
              <Text
                style={[
                  styles.buttonText,
                  action === "delete" && styles.whiteText,
                ]}
              >
                {t(`${action}.${item}.confirm`)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

export default Confirmation;

const styles = StyleSheet.create({
  textContentContainer: {
    flexDirection: "column",
    gap: 6,
    width: "90%",
  },
  iconDanger: {
    backgroundColor: myTheme.red[200],
  },
  iconContainer: {
    borderRadius: 50,
    padding: 4,
    width: "10%",
  },
  iconContentContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  buttonText: { fontWeight: "bold" },
  dangerText: {
    color: myTheme.red[500],
  },
  warningText: {
    color: myTheme.yellow[500],
  },
  whiteText: {
    color: myTheme.white,
  },
  dangerOutline: {
    color: myTheme.red[500],
    backgroundColor: myTheme.white,
    borderColor: myTheme.red[500],
  },
  danger: {
    color: myTheme.white,
    backgroundColor: myTheme.red[500],
    borderColor: myTheme.red[500],
  },
  warning: {
    color: myTheme.white,
    backgroundColor: myTheme.yellow[500],
    borderColor: myTheme.yellow[500],
  },
  warningOutline: {
    color: myTheme.yellow[500],
    backgroundColor: myTheme.white,
    borderColor: myTheme.yellow[500],
  },
  button: {
    width: 70,
    height: 35,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
  },

  description: {
    color: myTheme.mutedForeground,
    flexDirection: "row",
    flexWrap: "wrap",
    width: "100%",
    textOverflow: "wrap",
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    flex: 1,
    alignItems: "center",
    gap: 6,
    marginTop: 10,
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
});
