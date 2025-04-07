import * as React from "react";
import { useTranslation } from "react-i18next";
import { Button, View } from "react-native";
import { Text } from "react-native";
import { StyleSheet } from "react-native";
import { Dialog, PanningProvider } from "react-native-ui-lib";
import ImageWithFallback from "../image/ImageWithFallBack";
import { useVideoPlayer, VideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";

interface PreviewDialogProps {
  content: string | React.ReactNode;
  contentType?: "image" | "text" | "video";
  style?: object;
  isVisible: boolean;
  onDismiss: () => void;
}

export function PreviewDialog({
  content,
  contentType,
  style,
  isVisible,
  onDismiss,
}: PreviewDialogProps) {
  const { t } = useTranslation();
  const fallbackPlayer = {
    on: () => {},
    off: () => {},
    playing: false,
  } as unknown as VideoPlayer;
  const player =
    typeof content === "string"
      ? useVideoPlayer(content, (player) => {
          player.loop = true;
          player.play();
        })
      : null;

  const { isPlaying } = useEvent(player ?? fallbackPlayer, "playingChange", {
    isPlaying: player?.playing ?? false,
  });

  const renderContent = () => {
    if (contentType === "image" && typeof content === "string") {
      return (
        <View style={styles.mediaContainer}>
          <ImageWithFallback
            src={content}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      );
    } else if (
      contentType === "video" &&
      typeof content === "string" &&
      player
    ) {
      return (
        <View style={styles.mediaContainer}>
          <VideoView
            style={styles.video}
            player={player}
            allowsFullscreen
            allowsPictureInPicture
          />
          <View style={styles.controlsContainer}>
            <Button
              title={isPlaying ? "Pause" : "Play"}
              onPress={() => {
                if (isPlaying) {
                  player.pause();
                } else {
                  player.play();
                }
              }}
            />
          </View>
        </View>
      );
    } else {
      return <View style={styles.content}>{content}</View>;
    }
  };

  return (
    <Dialog
      visible={isVisible}
      onDismiss={onDismiss}
      panDirection={PanningProvider.Directions.DOWN}
      containerStyle={[styles.dialogContainer, style]}
    >
      <Text style={styles.title}>{t("media.previewImage")}</Text>
      <View style={styles.contentContainer}>{renderContent()}</View>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  controlsContainer: {
    padding: 10,
  },
  dialogContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    maxWidth: "80%",
    maxHeight: "80%",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  contentContainer: {
    overflow: "hidden",
    maxHeight: 320,
  },
  mediaContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  image: {
    width: "100%",
    height: 300,
    borderRadius: 8,
  },
  video: {
    width: "100%",
    height: 300,
    borderRadius: 8,
  },
  content: {
    paddingVertical: 8,
  },
});
