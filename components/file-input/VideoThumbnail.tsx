import { useEffect, useState } from "react";

import { TServerFile } from "@/types/file";
import { TouchableOpacity } from "react-native";
import { View } from "react-native";
import ImageWithFallback from "../image/ImageWithFallBack";
import { Feather } from "@expo/vector-icons";
import { myTheme } from "@/constants";
import { StyleSheet } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";

interface VideoThumbnailProps {
  file: File;
  style?: {};
  onPress?: () => void;
}

export function VideoThumbnail({ file, style, onPress }: VideoThumbnailProps) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;

    // Create object URL from the File object
    const fileUrl = URL.createObjectURL(file);

    // Create video element to generate thumbnail
    const video = document.createElement("video");
    video.src = fileUrl;
    video.crossOrigin = "anonymous";
    video.muted = true;

    // Listen for metadata loaded to know when video is ready
    video.addEventListener("loadedmetadata", () => {
      // Seek to the 1 second mark or 25% of video, whatever is smaller
      video.currentTime = Math.min(1, video.duration * 0.25);
    });

    // Create thumbnail once we've seeked to the right spot
    video.addEventListener("seeked", () => {
      // Create a canvas to draw the video frame
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the video frame to the canvas
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Convert canvas to data URL and set as thumbnail
        setThumbnail(canvas.toDataURL("image/jpeg"));
      }

      // Clean up
      video.pause();
      video.src = "";
      video.load();
      URL.revokeObjectURL(fileUrl); // Clean up the object URL
    });

    // Handle errors
    video.addEventListener("error", (e) => {
      console.error("Error generating video thumbnail", e);
      URL.revokeObjectURL(fileUrl); // Clean up the object URL on error too
    });

    // Start loading the video
    video.load();

    // Cleanup function
    return () => {
      URL.revokeObjectURL(fileUrl);
    };
  }, [file]);
  console.log(thumbnail);
  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      {thumbnail ? (
        // Show the actual thumbnail with play button overlay
        <View style={styles.thumbnailContainer}>
          <ImageWithFallback
            src={thumbnail}
            style={styles.thumbnailImage}
            resizeMode="cover"
          />
          <View style={styles.overlay}>
            <Feather name="play-circle" size={40} color="white" />
          </View>
        </View>
      ) : (
        // Fallback while thumbnail is generating
        <View style={styles.fallbackContainer}>
          <Feather name="play-circle" size={40} color={myTheme.primary} />
        </View>
      )}
      <View style={styles.videoIndicator}>
        <Feather name="video" size={16} color="white" />
      </View>
    </TouchableOpacity>
  );
}

export function VideoThumbnailServer({
  file,
  style,
  onPress,
}: {
  file: TServerFile;
  style?: {};
  onPress?: () => void;
}) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!file || !file.fileUrl) {
      setIsLoading(false);
      return;
    }

    // Create video element to generate thumbnail
    const video = document.createElement("video");
    video.src = file.fileUrl;
    video.crossOrigin = "anonymous";
    video.muted = true;

    // Listen for metadata loaded to know when video is ready
    video.addEventListener("loadedmetadata", () => {
      // Seek to the 1 second mark or 25% of video, whatever is smaller
      video.currentTime = Math.min(1, video.duration * 0.25);
    });

    // Create thumbnail once we've seeked to the right spot
    video.addEventListener("seeked", () => {
      // Create a canvas to draw the video frame
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the video frame to the canvas
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Convert canvas to data URL and set as thumbnail
        setThumbnail(canvas.toDataURL("image/jpeg"));
      }

      // Clean up
      video.pause();
      video.src = "";
      video.load();
      setIsLoading(false);
    });

    // Handle errors
    video.addEventListener("error", () => {
      setIsLoading(false);
    });

    // Start loading the video
    video.load();

    // Cleanup function
    return () => {
      video.src = "";
      video.load();
    };
  }, [file]);
  const player = useVideoPlayer(file.fileUrl, (player) => {
    player.loop = true;
    player.play();
  });

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      {thumbnail ? (
        // Show the actual thumbnail with play button overlay
        <View style={styles.thumbnailContainer}>
          <ImageWithFallback src={thumbnail} style={styles.thumbnailImage} />
          <View style={styles.overlay}>
            <Feather name="play-circle" size={40} color="white" />
          </View>
        </View>
      ) : (
        // Fallback while thumbnail is generating
        <View style={styles.fallbackContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Feather
                name="play-circle"
                size={40}
                color={`${myTheme.primary}99`}
              />
            </View>
          ) : (
            // Video poster fallback if thumbnail generation failed
            <View style={styles.thumbnailContainer}>
              <VideoView
                style={styles.thumbnailImage}
                player={player}
                allowsFullscreen
                allowsPictureInPicture
              />
              <View style={styles.overlay}>
                <Feather name="play-circle" size={40} color="white" />
              </View>
            </View>
          )}
        </View>
      )}
      <View style={styles.videoIndicator}>
        <Feather name="video" size={16} color="white" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    width: "100%",
    height: "100%",
    borderRadius: 8,
    overflow: "hidden",
  },
  thumbnailContainer: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  fallbackContainer: {
    backgroundColor: "rgba(0,0,0,0.1)",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  videoIndicator: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 50,
    padding: 4,
  },
  loadingContainer: {
    opacity: 0.6,
    transform: [{ scale: 1 }],
  },
});
