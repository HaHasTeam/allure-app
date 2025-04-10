import { useToast } from "@/contexts/ToastContext";
import { collectVoucherApi } from "@/hooks/api/voucher";
import useHandleServerError from "@/hooks/useHandleServerError";
import {
  DiscountTypeEnum,
  VoucherApplyTypeEnum,
  VoucherUsedStatusEnum,
} from "@/types/enum";
import { IBrandBestVoucher, TVoucher } from "@/types/voucher";
import { useMutation } from "@tanstack/react-query";
import { Dispatch, SetStateAction, useState } from "react";
import { useTranslation } from "react-i18next";
import StatusTag from "../tag/StatusTag";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ImageWithFallback from "../image/ImageWithFallBack";
import { myTheme } from "@/constants";
import VoucherWarning from "./VoucherWarning";
import { RadioButton } from "react-native-ui-lib";

interface VoucherItemProps {
  voucher: TVoucher;
  brandLogo: string;
  brandName: string;
  hasBrandProductSelected: boolean;
  selectedVoucher: string;
  onCollectSuccess?: () => void;
  status?:
    | VoucherUsedStatusEnum.AVAILABLE
    | VoucherUsedStatusEnum.UNAVAILABLE
    | VoucherUsedStatusEnum.UNCLAIMED;
  bestVoucherForBrand: IBrandBestVoucher;
  handleVoucherSelection: (voucherId: string) => void;
}
const VoucherItem = ({
  voucher,
  brandLogo,
  brandName,
  hasBrandProductSelected,
  selectedVoucher,
  status,
  onCollectSuccess,
  bestVoucherForBrand,
  handleVoucherSelection,
}: VoucherItemProps) => {
  const { t } = useTranslation();
  const [isCollecting, setIsCollecting] = useState(false);
  const handleServerError = useHandleServerError();
  const { showToast } = useToast();

  const { mutateAsync: collectVoucherFn } = useMutation({
    mutationKey: [collectVoucherApi.mutationKey],
    mutationFn: collectVoucherApi.fn,
    onSuccess: async (data) => {
      console.log(data);
      setIsCollecting(false);
      try {
        showToast(t("voucher.collectSuccess"), "success", 4000);
        if (onCollectSuccess) {
          onCollectSuccess();
        }
      } catch (error) {
        handleServerError({ error });
      }
    },
    onError: (error) => {
      setIsCollecting(false);
      handleServerError({ error });
    },
  });
  async function handleCollectVoucher() {
    try {
      setIsCollecting(true);
      await collectVoucherFn(voucher);
    } catch (error) {
      setIsCollecting(false);
      handleServerError({ error });
    }
  }
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {bestVoucherForBrand?.bestVoucher?.id === voucher?.id && (
          <View style={styles.tagContainer}>
            <StatusTag tag="BestVoucher" />
          </View>
        )}
        <View
          style={[
            status === VoucherUsedStatusEnum.UNAVAILABLE && styles.opacity,
            styles.voucherContentContainer,
          ]}
        >
          <View style={styles.commonFlex}>
            {/* Logo Section */}

            {brandLogo && brandLogo !== "" ? (
              <View style={styles.imageContainer}>
                <ImageWithFallback
                  src={brandLogo}
                  alt="Brand logo"
                  resizeMode="contain"
                  style={[styles.fullWidth, styles.fullHeight, styles.radiusSm]}
                />
              </View>
            ) : (
              <View style={styles.flex}>
                <Text style={styles.brandText}>{brandName}</Text>
              </View>
            )}

            {/* Content Section */}
            <View style={styles.contentSectionContainer}>
              <View style={styles.header}>
                <View style={styles.detailsContainer}>
                  <View style={styles.discountContainer}>
                    <View style={styles.textContainer}>
                      <Text style={styles.fontMedium}>
                        {voucher?.discountType === DiscountTypeEnum.PERCENTAGE
                          ? t("voucher.off.percentage", {
                              percentage: voucher?.discountValue * 100,
                            }) + ". "
                          : t("voucher.off.amount", {
                              amount: voucher?.discountValue,
                            }) + ". "}
                      </Text>
                      {voucher?.maxDiscount && (
                        <Text style={styles.fontMedium}>
                          {t("voucher.off.maxDiscount", {
                            amount: voucher?.maxDiscount,
                          }) + ". "}
                        </Text>
                      )}
                    </View>
                    {/* <VoucherInformationPopup
                      voucher={voucher}
                      className="flex items-start"
                    /> */}
                  </View>
                  {voucher?.minOrderValue && (
                    <Text style={styles.minOrderText}>
                      {t("voucher.off.minOrder", {
                        amount: voucher?.minOrderValue,
                      })}
                    </Text>
                  )}

                  {voucher?.applyType === VoucherApplyTypeEnum.SPECIFIC && (
                    <View style={styles.specificTag}>
                      <Text style={styles.specificTagText}>
                        {t("voucher.off.specific")}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <Text style={styles.expiryText}>
                {t("date.exp")}:{" "}
                {t("date.toLocaleDateTimeString", {
                  val: new Date(voucher?.endTime),
                })}
              </Text>
            </View>

            {status === VoucherUsedStatusEnum?.UNCLAIMED ? (
              <View style={styles.fullHeight}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => {
                    handleCollectVoucher();
                  }}
                >
                  {isCollecting ? (
                    <ActivityIndicator size="small" color={myTheme.primary} />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      {t("button.save")}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              (status === VoucherUsedStatusEnum?.UNAVAILABLE ||
                status === VoucherUsedStatusEnum?.AVAILABLE) && (
                <RadioButton
                  selected={voucher?.id === selectedVoucher}
                  id={voucher?.id}
                  onPress={() => handleVoucherSelection(voucher?.id)}
                  //   checked={voucher?.id === selectedVoucher}
                  disabled={
                    !hasBrandProductSelected ||
                    status === VoucherUsedStatusEnum?.UNAVAILABLE
                  }
                  size={16}
                  color={myTheme.primary}
                />
              )
            )}
          </View>

          {/* Warning Message */}
        </View>
      </View>
      {status === VoucherUsedStatusEnum?.UNAVAILABLE && (
        <VoucherWarning
          reason={voucher?.reason}
          minOrderValue={voucher?.minOrderValue}
        />
      )}
    </View>
  );
};

export default VoucherItem;

const styles = StyleSheet.create({
  saveButtonText: {
    fontWeight: "bold",
    color: myTheme.white,
  },
  saveButton: {
    backgroundColor: myTheme.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: "auto",
  },
  radiusSm: {
    borderRadius: 8,
  },
  flex: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  brandText: {
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  imageContainer: {
    width: 60,
    height: 60,
  },
  container: {
    flexDirection: "column",
    gap: 3,
    marginBottom: 7,
  },
  commonFlex: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  contentContainer: {
    borderWidth: 1,
    borderColor: myTheme.gray[200],
    borderRadius: 10,
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    position: "relative",
  },
  tagContainer: {
    position: "absolute",
    top: -4,
    left: 0,
  },
  voucherContentContainer: {
    paddingHorizontal: 4,
    paddingVertical: 8,
    position: "relative",
  },
  fullWidth: {
    width: "100%",
  },
  fullHeight: {
    height: "100%",
  },
  opacity: {
    opacity: 0.5,
  },
  contentSectionContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
  },
  detailsContainer: {
    width: "100%",
  },
  discountContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  textContainer: {
    flexDirection: "column",
    flexWrap: "wrap",
    alignItems: "flex-start",
    gap: 4,
  },
  fontMedium: {
    fontSize: 12,
    fontWeight: "500",
  },
  minOrderText: {
    fontSize: 12,
    marginTop: 4,
  },
  specificTag: {
    borderWidth: 1,
    borderColor: "red",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  specificTagText: {
    color: "red",
    fontSize: 12,
  },
  expiryText: {
    marginTop: 4,
    fontSize: 10,
    color: "gray",
  },
});
