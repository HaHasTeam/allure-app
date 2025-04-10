import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import { myTheme } from "@/constants";

interface FileDownloadButtonProps {
  previewUrl: string;
  index: number;
  fileName: string;
}
const FileDownloadButton = ({
  previewUrl,
  index,
  fileName,
}: FileDownloadButtonProps) => {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleDownload = async () => {
    try {
      setDownloading(true);

      // Create a progress callback
      const progressCallback = (
        downloadProgress: FileSystem.DownloadProgressData
      ) => {
        const progress =
          downloadProgress.totalBytesWritten /
          downloadProgress.totalBytesExpectedToWrite;
        setProgress(progress);
      };

      // Create a unique file name in the document directory
      const fileUri =
        FileSystem.documentDirectory +
        (fileName ||
          `downloaded_file_${index}.${getFileExtension(previewUrl)}`);

      // Create a download resumable
      const downloadResumable = FileSystem.createDownloadResumable(
        previewUrl,
        fileUri,
        {},
        progressCallback
      );

      // Start the download
      const { uri } = await downloadResumable.downloadAsync();
      console.log("Finished downloading to", uri);

      // Save download info for resuming later if needed
      await AsyncStorage.setItem(
        `download_${index}`,
        JSON.stringify(downloadResumable.savable())
      );

      // Share the downloaded file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }

      setDownloading(false);
    } catch (error) {
      console.error("Download error:", error);
      setDownloading(false);

      // Attempt to resume download if it failed
      tryResumeDownload(previewUrl, index);
    }
  };

  const tryResumeDownload = async (url: string, index: number) => {
    try {
      const downloadSnapshotJson = await AsyncStorage.getItem(
        `download_${index}`
      );

      if (downloadSnapshotJson) {
        setDownloading(true);

        const downloadSnapshot = JSON.parse(downloadSnapshotJson);
        const progressCallback = (
          downloadProgress: FileSystem.DownloadProgressData
        ) => {
          const progress =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
          setProgress(progress);
        };

        const downloadResumable = new FileSystem.DownloadResumable(
          downloadSnapshot.url,
          downloadSnapshot.fileUri,
          downloadSnapshot.options,
          progressCallback,
          downloadSnapshot.resumeData
        );

        const { uri } = await downloadResumable.resumeAsync();
        console.log("Resumed downloading to", uri);

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri);
        }
      }
    } catch (error) {
      console.error("Resume download error:", error);
    } finally {
      setDownloading(false);
    }
  };

  const getFileExtension = (url: string) => {
    // Extract file extension from URL
    const match = url.match(/\.([0-9a-z]+)(?:[\?#]|$)/i);
    return match ? match[1] : "file";
  };

  return (
    <TouchableOpacity
      onPress={handleDownload}
      disabled={downloading}
      accessibilityLabel={`Download file ${index}`}
    >
      {downloading ? (
        <View>
          <ActivityIndicator size="small" color="#f59e0b" />
          <Text style={{ fontSize: 10 }}>{Math.round(progress * 100)}%</Text>
        </View>
      ) : (
        <Feather
          name="download"
          size={16}
          color={myTheme.yellow[700]}
          style={[styles.actionIcon, { opacity: downloading ? 0.5 : 1 }]}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  actionIcon: {
    fontWeight: "bold",
  },
});
export default FileDownloadButton;
