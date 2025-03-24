import {
  FlatList,
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
  IVoucherUI,
  TVoucher,
} from "@/types/voucher";
import { useMutation } from "@tanstack/react-query";
import { getCheckoutListBrandVouchersApi } from "@/hooks/api/voucher";
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

interface VoucherBrandListProps {
  triggerText: string;
  brandName: string;
  brandId: string;
  brandLogo: string;
  hasBrandProductSelected: boolean;
  checkoutItems: ICheckoutItem[];
  selectedCheckoutItems: ICheckoutItem[];
  handleVoucherChange: (voucher: TVoucher | null) => void;
  bestVoucherForBrand: IBrandBestVoucher;
  chosenBrandVoucher: TVoucher | null;
  voucherDiscount: number;
  setIsModalVisible: Dispatch<SetStateAction<boolean>>;
  toggleModalVisibility: () => void;
  bottomSheetModalRef: React.RefObject<BottomSheetModal>;
}

const VoucherBrandList = ({
  triggerText,
  brandName,
  brandId,
  brandLogo,
  hasBrandProductSelected,
  handleVoucherChange,
  checkoutItems,
  bestVoucherForBrand,
  selectedCheckoutItems,
  chosenBrandVoucher,
  voucherDiscount,
  setIsModalVisible,
  toggleModalVisibility,
  bottomSheetModalRef,
}: VoucherBrandListProps) => {
  const { t } = useTranslation();
  const handleServerError = useHandleServerError();
  const [open, setOpen] = useState<boolean>(false);
  const [selectedVoucher, setSelectedVoucher] = useState<string>(
    chosenBrandVoucher?.id ?? ""
  );
  const [allVouchers, setAllVouchers] = useState<IVoucherUI[]>([]);
  const [unclaimedVouchers, setUnclaimedVouchers] = useState<TVoucher[]>([]);
  const [availableVouchers, setAvailableVouchers] = useState<TVoucher[]>([]);
  const [unAvailableVouchers, setUnAvailableVouchers] = useState<TVoucher[]>(
    []
  );
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

  // const { data: useBrandVoucher } = useQuery({
  //   queryKey: [getBrandVouchersApi.queryKey, brandId as string],
  //   queryFn: getBrandVouchersApi.fn,
  // })

  const { mutateAsync: callBrandVouchersFn } = useMutation({
    mutationKey: [getCheckoutListBrandVouchersApi.mutationKey],
    mutationFn: getCheckoutListBrandVouchersApi.fn,
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

  // const handleConfirm = () => {
  //   handleVoucherChange(
  //     availableVouchers?.find((voucher) => voucher?.id === selectedVoucher) ??
  //       null
  //   );
  //   setOpen(false);
  // };

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

  async function handleCallBrandVouchers() {
    try {
      if (checkoutItems && checkoutItems?.length > 0) {
        setIsLoading(true);
        await callBrandVouchersFn({
          checkoutItems:
            selectedCheckoutItems && selectedCheckoutItems?.length > 0
              ? selectedCheckoutItems
              : checkoutItems,
          brandItems:
            selectedCheckoutItems && selectedCheckoutItems?.length > 0
              ? selectedCheckoutItems
              : checkoutItems,
          brandId: brandId,
        });
      }
    } catch (error) {
      handleServerError({ error });
      setIsLoading(false);
    }
  }

  const openModal = () => {
    setOpen(true);
    handleCallBrandVouchers(); // Load the vouchers when opening the modal
    bottomSheetModalRef.current?.present();
    setIsModalVisible(true);
  };

  useEffect(() => {
    if (chosenBrandVoucher?.id) {
      setSelectedVoucher(chosenBrandVoucher.id);
    } else {
      setSelectedVoucher("");
    }
  }, [chosenBrandVoucher]);

  // useEffect(() => {
  //   if (useBrandVoucher && useBrandVoucher?.data?.length > 0) {
  //     console.log(useBrandVoucher?.data)
  //     setBrandVouchers(useBrandVoucher?.data)
  //   }
  // }, [useBrandVoucher])
  const handleVoucherSelection = (voucherId: string) => {
    setSelectedVoucher(voucherId);
  };
  useEffect(() => {
    if (!hasBrandProductSelected || voucherDiscount === 0) {
      setSelectedVoucher("");
    }
  }, [hasBrandProductSelected, voucherDiscount]);
  const renderVoucherItem = ({
    item,
  }: {
    item: TVoucher & { statusVoucher: VoucherUsedStatusEnum };
  }) => (
    <VoucherItem
      key={item.id}
      handleVoucherSelection={handleVoucherSelection}
      voucher={item}
      brandLogo={brandLogo}
      brandName={brandName}
      hasBrandProductSelected={hasBrandProductSelected}
      selectedVoucher={selectedVoucher}
      status={item.statusVoucher}
      onCollectSuccess={handleCallBrandVouchers}
      bestVoucherForBrand={bestVoucherForBrand}
    />
  );
  return (
    <>
      <Text
        style={styles.link}
        onPress={() => {
          toggleModalVisibility();
          handleCallBrandVouchers();
        }}
      >
        {triggerText}
      </Text>
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
            <View style={styles.fullWidth}>
              <Text style={styles.title}>
                {brandName} {t("voucher.title")}
              </Text>
              {!hasBrandProductSelected && (
                <View style={styles.alertBox}>
                  <Feather
                    name="alert-circle"
                    size={20}
                    style={styles.alertIcon}
                  />
                  <Text>{t("voucher.chooseProductBrandAlert")}</Text>
                </View>
              )}

              {isLoading ? (
                <ActivityIndicator size="small" color={myTheme.primary} />
              ) : allVouchers && allVouchers?.length > 0 ? (
                <View style={styles.gap}>
                  <FlatList
                    data={allVouchers}
                    renderItem={renderVoucherItem}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                  />
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.buttonCancel}
                      onPress={() => toggleModalVisibility()}
                    >
                      <Text style={[styles.textPrimary, styles.fontBold]}>
                        {t("dialog.cancel")}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.buttonConfirm}
                      onPress={() => {
                        handleConfirm();
                        toggleModalVisibility();
                      }}
                      disabled={!hasBrandProductSelected}
                    >
                      <Text style={[styles.textWhite, styles.fontBold]}>
                        {t("dialog.ok")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Empty
                    title={t("empty.brandVoucher.title")}
                    description={t("empty.brandVoucher.description")}
                  />
                </View>
              )}
            </View>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
};

export default VoucherBrandList;

const styles = StyleSheet.create({
  link: { color: myTheme.blue[700] },
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
  },

  emptyContainer: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
});
