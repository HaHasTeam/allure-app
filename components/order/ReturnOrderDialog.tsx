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
import { ShippingStatusEnum } from "@/types/enum";

import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
  TouchableWithoutFeedback,
} from "@gorhom/bottom-sheet";
import { getReturnOrderSchema } from "@/schema/order.schema";
import {
  getOrderByIdApi,
  getStatusTrackingByIdApi,
  updateOrderStatusApi,
} from "@/hooks/api/order";
import { uploadFilesApi } from "@/hooks/api/file";
import { Image, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { View } from "react-native";
import { Text } from "react-native";
import AlertMessage from "../alert/AlertMessage";
import { useToast } from "@/contexts/ToastContext";
import { Feather } from "@expo/vector-icons";
import { myTheme } from "@/constants";
import { hexToRgba } from "@/utils/color";
import { VideoThumbnail } from "../file-input/VideoThumbnail";
import UploadMediaFiles from "../file-input/UploadMediaFiles";

interface ReturnOrderDialogProps {
  orderId: string;
  setIsModalVisible: Dispatch<SetStateAction<boolean>>;
  toggleModalVisibility: () => void;
  bottomSheetModalRef: React.RefObject<BottomSheetModal>;
}

export const ReturnOrderDialog: React.FC<ReturnOrderDialogProps> = ({
  orderId,
  setIsModalVisible,
  toggleModalVisibility,
  bottomSheetModalRef,
}) => {
  const MAX_IMAGES = 4;
  const MAX_VIDEOS = 1;
  // const MAX_FILES = MAX_IMAGES + MAX_VIDEOS
  const MAX_SIZE_NUMBER = 10;
  const MAX_SIZE = MAX_SIZE_NUMBER * 1024 * 1024;

  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const handleServerError = useHandleServerError();
  const id = useId();
  const ReturnOrderSchema = getReturnOrderSchema();
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

  const defaultValues = {
    mediaFiles: [],
    videos: [],
    images: [],
  };

  const {
    control,
    handleSubmit,
    resetField,
    reset,
    watch,
    formState: { errors },
  } = useForm<z.infer<typeof ReturnOrderSchema>>({
    resolver: zodResolver(ReturnOrderSchema),
    defaultValues: defaultValues,
  });
  const handleReset = () => {
    reset();
    handleModalDismiss();
  };
  const { mutateAsync: updateOrderStatusFn } = useMutation({
    mutationKey: [updateOrderStatusApi.mutationKey],
    mutationFn: updateOrderStatusApi.fn,
    onSuccess: async () => {
      showToast(
        t("return.returnOrderEvidenceDialog.returnOrderShipmentSuccessMessage"),
        "success",
        4000
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [getOrderByIdApi.queryKey] }),
        queryClient.invalidateQueries({
          queryKey: [getStatusTrackingByIdApi.queryKey],
        }),
      ]);
      handleReset();
    },
  });

  const { mutateAsync: uploadFilesFn } = useMutation({
    mutationKey: [uploadFilesApi.mutationKey],
    mutationFn: uploadFilesApi.fn,
  });

  const convertFileToUrl = async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const uploadedFilesResponse = await uploadFilesFn(formData);

    return uploadedFilesResponse.data;
  };

  const onSubmit = async (values: z.infer<typeof ReturnOrderSchema>) => {
    try {
      setIsLoading(true);
      const imgUrls = values.images
        ? await convertFileToUrl(values.images)
        : [];
      const videoUrls = values.videos
        ? await convertFileToUrl(values.videos)
        : [];

      await updateOrderStatusFn({
        id: orderId,
        status: ShippingStatusEnum.RETURNING,
        mediaFiles: [...imgUrls, ...videoUrls],
      });
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      handleServerError({
        error,
      });
    }
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
        <Text style={styles.heading}>
          {t("return.returnOrderEvidenceDialog.title")}
        </Text>
        <Text style={styles.textJustify}>
          {t("return.returnOrderEvidenceDialog.description")}
        </Text>

        <ScrollView>
          <AlertMessage
            style={styles.textJustify}
            message={t("order.cancelOrderDescription", { brand: "" })}
            textSize="medium"
          />

          {/* media */}
          <View style={styles.mediaContainer}>
            <Text style={[styles.label, { color: myTheme.primary }]}>
              {t("feedback.mediaFiles")} *
            </Text>
            <Text style={styles.formDescription}>
              {t("return.returnOrderEvidenceDialog.mediaFilesNotes")}
            </Text>
            <Text style={styles.formDescription}>
              {t("feedback.mediaFilesHint", {
                videoCount: MAX_VIDEOS,
                imageCount: MAX_IMAGES,
                size: MAX_SIZE_NUMBER,
                format:
                  "mp4/wmv/mov/avi/mkv/flv/jpg/jpeg/png".toLocaleUpperCase(),
              })}
            </Text>
          </View>

          <View style={styles.formFieldsContainer}>
            <Controller
              control={control}
              name="videos"
              render={({ field }) => (
                <View style={styles.fieldContainer}>
                  <Text style={[styles.label, { color: myTheme.primary }]}>
                    {t("feedback.uploadVideos")} *
                  </Text>
                  <UploadMediaFiles
                    field={field}
                    vertical={false}
                    isAcceptImage={false}
                    isAcceptVideo={true}
                    maxImages={MAX_IMAGES}
                    maxVideos={MAX_VIDEOS}
                    dropZoneConfigOptions={{
                      maxFiles: MAX_VIDEOS,
                      maxSize: MAX_SIZE,
                    }}
                    renderFileItemUI={(file) => (
                      <View key={file.name} style={styles.fileItem}>
                        {file.type.includes("image") ? (
                          <Image
                            source={{ uri: URL.createObjectURL(file) }}
                            style={styles.mediaPreview}
                            onLoad={() =>
                              URL.revokeObjectURL(URL.createObjectURL(file))
                            }
                          />
                        ) : file.type.includes("video") ? (
                          <VideoThumbnail file={file} />
                        ) : (
                          <View style={styles.placeholderContainer}>
                            <Feather
                              name="file"
                              size={48}
                              color={myTheme.mutedForeground}
                            />
                          </View>
                        )}
                      </View>
                    )}
                    renderInputUI={(_isDragActive, files, maxFiles) => (
                      <View style={styles.uploadContainer}>
                        <Feather
                          name="video"
                          size={32}
                          color={myTheme.primary}
                        />
                        <Text
                          style={[
                            styles.uploadText,
                            { color: myTheme.mutedForeground },
                          ]}
                        >
                          {files.length}/{maxFiles} {t("media.videosFile")}
                        </Text>
                      </View>
                    )}
                  />
                  {errors.videos && (
                    <Text style={styles.errorText}>
                      {errors.videos.message}
                    </Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="images"
              render={({ field }) => (
                <View style={styles.fieldContainer}>
                  <Text style={[styles.label, { color: myTheme.primary }]}>
                    {t("feedback.uploadImages")} *
                  </Text>
                  <UploadMediaFiles
                    field={field}
                    vertical={false}
                    isAcceptImage={true}
                    isAcceptVideo={false}
                    maxImages={MAX_IMAGES}
                    maxVideos={MAX_VIDEOS}
                    dropZoneConfigOptions={{
                      maxFiles: MAX_IMAGES,
                      maxSize: MAX_SIZE,
                    }}
                    renderFileItemUI={(file) => (
                      <View key={file.name} style={styles.fileItem}>
                        {file.type.includes("image") ? (
                          <Image
                            source={{ uri: URL.createObjectURL(file) }}
                            style={styles.mediaPreview}
                            onLoad={() =>
                              URL.revokeObjectURL(URL.createObjectURL(file))
                            }
                          />
                        ) : file.type.includes("video") ? (
                          <VideoThumbnail file={file} />
                        ) : (
                          <View style={styles.placeholderContainer}>
                            <Feather
                              name="file"
                              size={48}
                              color={myTheme.mutedForeground}
                            />
                          </View>
                        )}
                      </View>
                    )}
                    renderInputUI={(_isDragActive, files, maxFiles) => (
                      <View style={styles.uploadContainer}>
                        <Feather
                          name="image"
                          size={32}
                          color={myTheme.primary}
                        />
                        <Text
                          style={[
                            styles.uploadText,
                            { color: myTheme.mutedForeground },
                          ]}
                        >
                          {files.length}/{maxFiles} {t("media.imagesFile")}
                        </Text>
                      </View>
                    )}
                  />
                  {errors.images && (
                    <Text style={styles.errorText}>
                      {errors.images.message}
                    </Text>
                  )}
                </View>
              )}
            />
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                handleReset();
              }}
            >
              <Text style={[styles.buttonText, { color: myTheme.primary }]}>
                {t("button.cancel")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>{t("button.submit")}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </BottomSheetView>
    </BottomSheetModal>
  );
};
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  textJustify: {
    textAlign: "justify",
    marginBottom: 12,
  },
  mediaContainer: {
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    marginBottom: 4,
  },
  formDescription: {
    fontSize: 14,
    color: myTheme.mutedForeground,
    textAlign: "justify",
    marginBottom: 4,
  },
  formFieldsContainer: {
    marginVertical: 8,
  },
  fieldContainer: {
    marginVertical: 12,
  },
  fileItem: {
    width: 128,
    height: 128,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: myTheme.gray[300],
  },
  mediaPreview: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadContainer: {
    width: 128,
    height: 128,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: myTheme.primary,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  uploadText: {
    fontSize: 12,
    marginTop: 8,
  },
  errorText: {
    color: myTheme.red[500],
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    gap: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: myTheme.primary,
    backgroundColor: hexToRgba(myTheme.primary, 0.1),
  },
  submitButton: {
    backgroundColor: myTheme.primary,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});
