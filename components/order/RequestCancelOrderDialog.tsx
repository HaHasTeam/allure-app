import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useId,
  useMemo,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import useHandleServerError from "@/hooks/useHandleServerError";

import AlertMessage from "../alert/AlertMessage";
import { getCancelOrderSchema } from "@/schema/order.schema";
import {
  cancelOrderApi,
  getCancelAndReturnRequestApi,
} from "@/hooks/api/order";
import { myTheme } from "@/constants";
import { StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import { View } from "react-native";
import { Picker } from "react-native-ui-lib";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
  TouchableWithoutFeedback,
} from "@gorhom/bottom-sheet";
import { useToast } from "@/contexts/ToastContext";

interface RequestCancelOrderDialogProps {
  orderId: string;
  onOpenChange: (open: boolean) => void;
  setIsModalVisible: Dispatch<SetStateAction<boolean>>;
  toggleModalVisibility: () => void;
  bottomSheetModalRef: React.RefObject<BottomSheetModal>;
  setIsTrigger: Dispatch<SetStateAction<boolean>>;
}

export default function RequestCancelOrderDialog({
  orderId,
  onOpenChange,
  setIsModalVisible,
  toggleModalVisibility,
  bottomSheetModalRef,
  setIsTrigger,
}: RequestCancelOrderDialogProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const formId = useId();
  const handleServerError = useHandleServerError();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOtherReason, setIsOtherReason] = useState<boolean>(false);
  const queryClient = useQueryClient();
  const CancelOrderSchema = getCancelOrderSchema();

  const reasons: { value: string }[] = useMemo(
    () => [
      { value: t("order.cancelOrderReason.changeOfMind") },
      { value: t("order.cancelOrderReason.foundCheaper") },
      { value: t("order.cancelOrderReason.voucherChange") },
      { value: t("order.cancelOrderReason.productChange") },
      { value: t("order.cancelOrderReason.paymentDifficulty") },
      { value: t("order.cancelOrderReason.addressChange") },
      { value: t("order.cancelOrderReason.deliveryIssue") },
      { value: t("order.cancelOrderReason.productIssue") },
      { value: t("order.cancelOrderReason.other") },
    ],
    [t]
  );
  const defaultOrderValues = {
    reason: "",
    otherReason: "",
  };
  const {
    control,
    handleSubmit,
    resetField,
    reset,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof CancelOrderSchema>>({
    resolver: zodResolver(CancelOrderSchema),
    defaultValues: defaultOrderValues,
  });
  const handleReset = () => {
    reset();
    handleModalDismiss();
    setIsOtherReason(false);
  };

  const { mutateAsync: cancelOrderFn } = useMutation({
    mutationKey: [cancelOrderApi.mutationKey],
    mutationFn: cancelOrderApi.fn,
    onSuccess: () => {
      showToast(t("order.requestCancelSuccess"), "success", 4000);

      setIsTrigger((prev) => !prev);
      queryClient.invalidateQueries({
        queryKey: [getCancelAndReturnRequestApi.queryKey],
      });
      handleReset();
    },
  });
  async function onSubmit(values: z.infer<typeof CancelOrderSchema>) {
    try {
      setIsLoading(true);
      const payload = isOtherReason
        ? { reason: values.otherReason }
        : { reason: values.reason };
      await cancelOrderFn({ orderId, ...payload });
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      handleServerError({
        error,
      });
    }
  }

  // bottom sheet for classification
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
        <Text style={styles.title}>{t(`order.requestCancelOrder`)}</Text>

        <AlertMessage
          style={styles.textJustify}
          message={t("order.requestCancelOrderDescription")}
          textSize="medium"
        />

        <View style={styles.formField}>
          <Controller
            control={control}
            name="reason"
            render={({ field: { onChange, value } }) => (
              <View style={styles.selectContainer}>
                <Text style={styles.label}>
                  {t("order.cancelOrderReason.reason")} *
                </Text>
                <Picker
                  value={value}
                  placeholder={t("order.cancelOrderReason.selectAReason")}
                  onChange={(newValue) => {
                    onChange(newValue);
                    setIsOtherReason(
                      newValue === t("order.cancelOrderReason.other")
                    );
                  }}
                  style={styles.picker}
                >
                  {reasons.map((reason, index) => (
                    <Picker.Item
                      key={index}
                      value={reason.value}
                      label={reason.value}
                    />
                  ))}
                </Picker>
                {errors.reason && (
                  <Text style={styles.error}>{errors.reason.message}</Text>
                )}
              </View>
            )}
          />
        </View>
        {isOtherReason && (
          <View style={styles.formField}>
            <Controller
              control={control}
              name="otherReason"
              render={({ field: { onChange, value } }) => (
                <View style={styles.textAreaContainer}>
                  <Text style={styles.label}>
                    {t("order.cancelOrderReason.otherReason")} *
                  </Text>
                  <TextInput
                    style={styles.textArea}
                    onChangeText={onChange}
                    value={value}
                    placeholder={t("order.cancelOrderReason.enterReason")}
                    placeholderTextColor="grey"
                    multiline
                    numberOfLines={4}
                  />
                  {errors.otherReason && (
                    <Text style={styles.error}>
                      {errors.otherReason.message}
                    </Text>
                  )}
                </View>
              )}
            />
          </View>
        )}

        <View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.buttonOutline}
              onPress={() => {
                onOpenChange(false);
                handleReset();
              }}
            >
              <Text style={styles.buttonText}>{t(`button.cancel`)}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonPrimary}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? "Loading..." : t(`button.ok`)}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  textJustify: {
    textAlign: "justify",
  },
  overlay: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  alert: {
    textAlign: "justify",
  },
  formField: {
    marginVertical: 12,
  },
  selectContainer: {
    flexDirection: "column",
  },
  textAreaContainer: {
    flexDirection: "column",
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  picker: {
    borderWidth: 1,
    borderColor: myTheme.primary,
    borderRadius: 7,
    padding: 12,
  },
  textArea: {
    borderWidth: 1,
    borderColor: myTheme.primary,
    borderRadius: 7,
    padding: 12,
    height: 100,
    textAlignVertical: "top",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 16,
  },
  buttonOutline: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: myTheme.primary,
    borderRadius: 7,
  },
  buttonPrimary: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: myTheme.primary,
    borderRadius: 7,
  },
  buttonText: {
    color: myTheme.white,
    textAlign: "center",
  },
});
