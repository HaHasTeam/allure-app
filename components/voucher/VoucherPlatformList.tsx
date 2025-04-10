import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityIndicator } from "react-native";
import { myTheme } from "@/constants";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import useHandleServerError from "@/hooks/useHandleServerError";
import { useTranslation } from "react-i18next";
import {
  IBrandBestVoucher,
  ICheckoutItem,
  IPlatformBestVoucher,
  IVoucherUI,
  TVoucher,
} from "@/types/voucher";
import { useMutation } from "@tanstack/react-query";
import {
  getCheckoutListBrandVouchersApi,
  getCheckoutListPlatformVouchersApi,
} from "@/hooks/api/voucher";
import { Feather } from "@expo/vector-icons";
import Empty from "../empty";
import { VoucherUsedStatusEnum } from "@/types/enum";
import VoucherItem from "./VoucherItem";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
  TouchableWithoutFeedback,
} from "@gorhom/bottom-sheet";
import { ICartByBrand } from "@/types/cart";
import { ProjectInformationEnum } from "@/types/project";
import LoadingIcon from "../loading/LoadingIcon";
import VoucherPlatformItem from "./VoucherPlatformItem";

interface VoucherPlatformListProps {
  triggerText: React.ReactElement<unknown>;
  onConfirmVoucher: (voucher: TVoucher | null) => void;
  selectedCartItems?: string[];
  chosenPlatformVoucher: TVoucher | null;
  cartByBrand: ICartByBrand;
  bestPlatFormVoucher: IPlatformBestVoucher | null;
  setIsModalVisible: Dispatch<SetStateAction<boolean>>;
  toggleModalVisibility: () => void;
  bottomSheetModalRef: React.RefObject<BottomSheetModal>;
  handleVoucherChange: (voucher: TVoucher | null) => void;
}

const VoucherPlatformList = ({
  triggerText,
  onConfirmVoucher,
  selectedCartItems,
  chosenPlatformVoucher,
  cartByBrand,
  bestPlatFormVoucher,
  setIsModalVisible,
  toggleModalVisibility,
  bottomSheetModalRef,
  handleVoucherChange,
}: VoucherPlatformListProps) => {
  const { t } = useTranslation();
  const handleServerError = useHandleServerError();
  const [open, setOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<string>(
    chosenPlatformVoucher?.id ?? ""
  );
  const [unclaimedVouchers, setUnclaimedVouchers] = useState<TVoucher[]>([]);
  const [availableVouchers, setAvailableVouchers] = useState<TVoucher[]>([]);
  const [unAvailableVouchers, setUnAvailableVouchers] = useState<TVoucher[]>(
    []
  );
  const [allVouchers, setAllVouchers] = useState<IVoucherUI[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  // bottom sheet for classification
  const snapPoints = useMemo(() => ["50%", "60%", "100%"], []);
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

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log("handleSheetChanges", index);
  }, []);
  const handleModalDismiss = () => {
    bottomSheetModalRef.current?.close();
    setIsModalVisible(false);
  };
  const checkoutItems: ICheckoutItem[] = Object.values(cartByBrand)
    .flat()
    .map((cartItem) => ({
      classificationId: cartItem.productClassification?.id ?? "",
      quantity: cartItem.quantity ?? 0,
    }))
    .filter((item) => item.classificationId !== "");

  const selectedCheckoutItems: ICheckoutItem[] = Object.values(cartByBrand)
    .flat()
    .filter((cartItem) => selectedCartItems?.includes(cartItem?.id)) // Filter selected cart items
    .map((cartItem) => ({
      classificationId: cartItem.productClassification?.id ?? "",
      quantity: cartItem.quantity ?? 0,
    }))
    .filter((item) => item.classificationId !== "");

  const { mutateAsync: callPlatformVouchersFn } = useMutation({
    mutationKey: [getCheckoutListPlatformVouchersApi.mutationKey],
    mutationFn: getCheckoutListPlatformVouchersApi.fn,
    onSuccess: (data) => {
      console.log(data);
      setUnclaimedVouchers(data?.data?.unclaimedVouchers);
      setAvailableVouchers(data?.data?.availableVouchers);
      setUnAvailableVouchers(data?.data?.unAvailableVouchers);
      setAllVouchers([
        ...(data?.data.availableVouchers || []).map((voucher) => ({
          ...voucher,
          statusVoucher: VoucherUsedStatusEnum.AVAILABLE,
        })),
        ...(data?.data.unAvailableVouchers || []).map((voucher) => ({
          ...voucher,
          statusVoucher: VoucherUsedStatusEnum.UNAVAILABLE,
        })),
        ...(data?.data.unclaimedVouchers || []).map((voucher) => ({
          ...voucher,
          statusVoucher: VoucherUsedStatusEnum.UNCLAIMED,
        })),
      ]);
      setIsLoading(false);
    },
  });

  //   const handleConfirm = () => {
  //     if (selectedVoucher) {
  //       onConfirmVoucher(availableVouchers?.find((voucher) => voucher?.id === selectedVoucher) ?? null)
  //     }
  //     setOpen(false) // Close the dialog
  //   }
  async function handleCallPlatformVouchers() {
    try {
      if (checkoutItems && checkoutItems?.length > 0) {
        setIsLoading(true);
        await callPlatformVouchersFn({
          checkoutItems:
            selectedCheckoutItems && selectedCheckoutItems?.length > 0
              ? selectedCheckoutItems
              : checkoutItems,
          brandItems:
            selectedCheckoutItems && selectedCheckoutItems?.length > 0
              ? selectedCheckoutItems
              : checkoutItems,
        });
      }
    } catch (error) {
      handleServerError({ error });
      setIsLoading(false);
    }
  }
  const handleConfirm = () => {
    // Find the selected voucher from allVouchers instead of availableVouchers
    const selectedVoucherObj = allVouchers.find(
      (voucher) => voucher.id === selectedVoucher
    );

    // Only select vouchers that are available
    if (
      selectedVoucherObj &&
      selectedVoucherObj.statusVoucher === VoucherUsedStatusEnum.AVAILABLE
    ) {
      handleVoucherChange(selectedVoucherObj);
    } else {
      handleVoucherChange(null);
    }

    setOpen(false);
    handleModalDismiss();
  };
  const handleVoucherSelection = (voucherId: string) => {
    setSelectedVoucher(voucherId);
  };

  useEffect(() => {
    if (!selectedCartItems || selectedCartItems?.length === 0) {
      setSelectedVoucher("");
    }
  }, [selectedCartItems]);

  return (
    <>
      <TouchableOpacity
        style={styles.commonFlex}
        onPress={() => {
          toggleModalVisibility();
          handleCallPlatformVouchers();
        }}
      >
        {triggerText}
      </TouchableOpacity>
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
            <View style={styles.headerContainer}>
              <Text style={styles.sheetTitle}>
                {t("voucher.chooseVoucher", {
                  projectName: ProjectInformationEnum.name,
                })}
              </Text>
            </View>
            <Text style={styles.sheetDescription}>
              {t("voucher.description")}
            </Text>
            <View style={styles.spacedSection}>
              <View>
                {/* Warning Message */}
                {selectedCartItems?.length === 0 && (
                  <View style={styles.warningContainer}>
                    <Feather
                      name="alert-circle"
                      size={20}
                      style={styles.alertIcon}
                    />
                    <Text style={styles.warningText}>
                      {t("voucher.chooseProductAppAlert")}
                    </Text>
                  </View>
                )}
              </View>
              {/* Voucher List */}
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <LoadingIcon color="primaryBackground" />
                </View>
              ) : (availableVouchers && availableVouchers?.length > 0) ||
                (unAvailableVouchers && unAvailableVouchers?.length > 0) ||
                (unclaimedVouchers && unclaimedVouchers?.length > 0) ? (
                <ScrollView style={styles.scrollArea}>
                  <View style={styles.radioGroup}>
                    {availableVouchers?.map((voucher) => (
                      <VoucherPlatformItem
                        voucher={voucher}
                        selectedCartItems={selectedCartItems}
                        key={voucher?.id}
                        bestVoucherForPlatform={bestPlatFormVoucher}
                        selectedVoucher={selectedVoucher}
                        onCollectSuccess={handleCallPlatformVouchers}
                        status={VoucherUsedStatusEnum.AVAILABLE}
                        handleVoucherSelection={handleVoucherSelection}
                      />
                    ))}
                    {unAvailableVouchers?.map((voucher) => (
                      <VoucherPlatformItem
                        handleVoucherSelection={handleVoucherSelection}
                        voucher={voucher}
                        selectedCartItems={selectedCartItems}
                        key={voucher?.id}
                        bestVoucherForPlatform={bestPlatFormVoucher}
                        selectedVoucher={selectedVoucher}
                        onCollectSuccess={handleCallPlatformVouchers}
                        status={VoucherUsedStatusEnum.UNAVAILABLE}
                      />
                    ))}
                    {unclaimedVouchers?.map((voucher) => (
                      <VoucherPlatformItem
                        handleVoucherSelection={handleVoucherSelection}
                        voucher={voucher}
                        selectedCartItems={selectedCartItems}
                        key={voucher?.id}
                        bestVoucherForPlatform={bestPlatFormVoucher}
                        selectedVoucher={selectedVoucher}
                        onCollectSuccess={handleCallPlatformVouchers}
                        status={VoucherUsedStatusEnum.UNCLAIMED}
                      />
                    ))}
                  </View>
                </ScrollView>
              ) : (
                <View style={styles.emptyContainer}>
                  <Empty
                    title={t("empty.platformVoucher.title")}
                    description={t("empty.platformVoucher.description", {
                      platformName: ProjectInformationEnum.name,
                    })}
                  />
                </View>
              )}
            </View>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.buttonOutline}
                onPress={handleModalDismiss}
              >
                <Text style={styles.buttonOutlineText}>
                  {t("dialog.cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.buttonPrimary,
                  selectedCartItems?.length === 0 && styles.buttonDisabled,
                ]}
                onPress={handleConfirm}
                disabled={selectedCartItems?.length === 0}
              >
                <Text style={styles.buttonPrimaryText}>{t("dialog.ok")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
};

export default VoucherPlatformList;

const styles = StyleSheet.create({
  commonFlex: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
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
  text: {
    color: "blue",
    textDecorationLine: "underline",
  },
  fontBold: {
    fontWeight: "bold",
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
  textPrimary: {
    color: myTheme.primary,
  },
  textWhite: {
    color: myTheme.white,
  },
  buttonCancel: {
    borderWidth: 1,
    borderColor: myTheme.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  buttonConfirm: {
    backgroundColor: myTheme.primary,
    borderColor: myTheme.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  fullWidth: { width: "100%" },
  voucherContainer: {
    paddingHorizontal: 6,
    flexDirection: "column",
    gap: 6,
  },
  gap: {
    gap: 6,
    flexDirection: "column",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    width: "100%",
    paddingTop: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 16,
  },

  alertBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
    color: "#EF4444",
    backgroundColor: "#FEE2E2",
    padding: 8,
    borderRadius: 4,
    marginBottom: 4,
  },

  alertIcon: {
    width: 16,
    height: 16,
    color: myTheme.red[500],
  },

  emptyContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },

  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  sheetDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  spacedSection: {
    marginBottom: 16,
  },
  warningContainer: {
    marginBottom: 8,
    padding: 10,
    backgroundColor: myTheme.red[100],
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  warningText: {
    color: myTheme.red[500],
    fontSize: 14,
    marginLeft: 8,
  },
  loadingContainer: {
    height: 144,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollArea: {
    height: 500,
  },
  radioGroup: {
    gap: 0,
  },
  buttonOutline: {
    borderWidth: 1,
    borderColor: myTheme.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  buttonOutlineText: {
    color: myTheme.primary,
  },
  buttonPrimary: {
    backgroundColor: myTheme.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: "center",
  },
  buttonPrimaryText: {
    color: myTheme.white,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
});
