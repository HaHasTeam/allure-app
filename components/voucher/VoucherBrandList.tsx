import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityIndicator } from "react-native";
import { myTheme } from "@/constants";
import { useEffect, useState } from "react";
import useHandleServerError from "@/hooks/useHandleServerError";
import { useTranslation } from "react-i18next";
import { IBrandBestVoucher, ICheckoutItem, TVoucher } from "@/types/voucher";
import { useMutation } from "@tanstack/react-query";
import { getCheckoutListBrandVouchersApi } from "@/hooks/api/voucher";
import { Feather } from "@expo/vector-icons";
import Empty from "../empty";
import { VoucherUsedStatusEnum } from "@/types/enum";
import VoucherItem from "./VoucherItem";

interface VoucherCartListProps {
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
}
const VoucherCartList = ({
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
}: VoucherCartListProps) => {
  const { t } = useTranslation();
  const handleServerError = useHandleServerError();
  const [open, setOpen] = useState<boolean>(false);
  const [selectedVoucher, setSelectedVoucher] = useState<string>(
    chosenBrandVoucher?.id ?? ""
  );
  const [allVouchers, setAllVouchers] = useState<TVoucher[]>([]);
  const [unclaimedVouchers, setUnclaimedVouchers] = useState<TVoucher[]>([]);
  const [availableVouchers, setAvailableVouchers] = useState<TVoucher[]>([]);
  const [unAvailableVouchers, setUnAvailableVouchers] = useState<TVoucher[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // const { data: useBrandVoucher } = useQuery({
  //   queryKey: [getBrandVouchersApi.queryKey, brandId as string],
  //   queryFn: getBrandVouchersApi.fn,
  // })

  const { mutateAsync: callBrandVouchersFn } = useMutation({
    mutationKey: [getCheckoutListBrandVouchersApi.mutationKey],
    mutationFn: getCheckoutListBrandVouchersApi.fn,
    onSuccess: (data) => {
      console.log(data);
      //   setUnclaimedVouchers(data?.data?.unclaimedVouchers);
      //   setAvailableVouchers(data?.data?.availableVouchers);
      //   setUnAvailableVouchers(data?.data?.unAvailableVouchers);
      setAllVouchers([
        ...(data?.data.availableVouchers || []).map((voucher) => ({
          ...voucher,
          status: VoucherUsedStatusEnum.AVAILABLE,
        })),
        ...(data?.data.unAvailableVouchers || []).map((voucher) => ({
          ...voucher,
          status: VoucherUsedStatusEnum.UNAVAILABLE,
        })),
        ...(data?.data.unclaimedVouchers || []).map((voucher) => ({
          ...voucher,
          status: VoucherUsedStatusEnum.UNCLAIMED,
        })),
      ]);
      setIsLoading(false);
    },
  });

  const handleConfirm = () => {
    handleVoucherChange(
      availableVouchers?.find((voucher) => voucher?.id === selectedVoucher) ??
        null
    );
    setOpen(false);
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

  // useEffect(() => {
  //   if (useBrandVoucher && useBrandVoucher?.data?.length > 0) {
  //     console.log(useBrandVoucher?.data)
  //     setBrandVouchers(useBrandVoucher?.data)
  //   }
  // }, [useBrandVoucher])

  useEffect(() => {
    if (!hasBrandProductSelected || voucherDiscount === 0) {
      setSelectedVoucher("");
    }
  }, [hasBrandProductSelected, voucherDiscount]);
  const renderVoucherItem = ({
    item,
  }: {
    item: TVoucher & { status: string };
  }) => (
    <VoucherItem
      key={item.id}
      setVoucher={setSelectedVoucher}
      voucher={item}
      brandLogo={brandLogo}
      brandName={brandName}
      hasBrandProductSelected={hasBrandProductSelected}
      selectedVoucher={selectedVoucher}
      status={VoucherUsedStatusEnum?.UNAVAILABLE}
      onCollectSuccess={handleCallBrandVouchers}
      bestVoucherForBrand={bestVoucherForBrand}
    />
  );
  return (
    <View>
      <Text style={styles.text} onPress={handleCallBrandVouchers}>
        {triggerText}
      </Text>

      <View style={styles.fullWidth}>
        <Text style={styles.title}>
          {brandName} {t("voucher.title")}
        </Text>
        {!hasBrandProductSelected && (
          <View style={styles.alertBox}>
            <Feather name="alert-circle" size={20} style={styles.alertIcon} />
            <Text>{t("voucher.chooseProductBrandAlert")}</Text>
          </View>
        )}

        {isLoading ? (
          <ActivityIndicator size="small" color={myTheme.primary} />
        ) : (availableVouchers && availableVouchers?.length > 0) ||
          (unAvailableVouchers && unAvailableVouchers?.length > 0) ||
          (unclaimedVouchers && unclaimedVouchers?.length > 0) ? (
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
                onPress={() => setOpen(false)}
              >
                <Text style={[styles.textWhite, styles.fontBold]}>
                  {t("dialog.cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.buttonConfirm}
                onPress={handleConfirm}
                disabled={!hasBrandProductSelected}
              >
                <Text style={[styles.textPrimary, styles.fontBold]}>
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
  );
};

export default VoucherCartList;

const styles = StyleSheet.create({
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
  },
  buttonConfirm: {
    backgroundColor: myTheme.primary,
    borderColor: myTheme.primary,
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
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    width: "100%",
    boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.06)",
    paddingTop: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "500",
    marginBottom: 16,
  },

  alertBox: {
    display: "flex",
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
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
});
