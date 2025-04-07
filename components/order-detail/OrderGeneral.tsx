import { myTheme } from "@/constants";
import { hexToRgba } from "@/utils/color";
import { Feather } from "@expo/vector-icons";
import { cloneElement, useEffect, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface OrderGeneralProps {
  title: string;
  icon: React.ReactElement;
  content: React.ReactElement;
  status?: "normal" | "success" | "warning" | "danger";
}

const MAX_HEIGHT = 176;
const OrderGeneral = ({
  title,
  icon,
  content,
  status = "normal",
}: OrderGeneralProps) => {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef(null);

  const handleContentLayout = (event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setContentHeight(height);
    setIsOverflowing(height > MAX_HEIGHT);
  };

  let color, borderColor;
  switch (status) {
    case "normal":
      color = myTheme.primary;
      borderColor = hexToRgba(myTheme.primary, 0.4);
      break;
    case "danger":
      color = myTheme.red[500];
      borderColor = myTheme.red[300];
      break;
    case "success":
      color = myTheme.green[500];
      borderColor = myTheme.green[300];
      break;
    case "warning":
      color = myTheme.yellow[500];
      borderColor = myTheme.yellow[300];
      break;
    default:
      color = myTheme.gray[500];
      borderColor = myTheme.gray[300];
      break;
  }

  const handleExpand = () => {
    setExpanded(!expanded);
  };
  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: myTheme.card,
          borderColor: borderColor,
        },
      ]}
    >
      <View style={[styles.header, { flexDirection: "row" }]}>
        {cloneElement(icon, { color: color, size: 24 })}
        <Text style={[styles.title, { color: color }]}>{title}</Text>
      </View>

      <View style={styles.contentContainer}>
        <View
          ref={contentRef}
          onLayout={handleContentLayout}
          style={[
            styles.content,
            expanded ? styles.contentExpanded : styles.contentCollapsed,
          ]}
        >
          <Text style={{ color: myTheme.gray[500] }}>{content}</Text>
        </View>

        {isOverflowing && !expanded && <View style={styles.gradientOverlay} />}

        {isOverflowing && (
          <View
            style={[
              styles.buttonContainer,
              expanded ? styles.relative : styles.absolute,
            ]}
          >
            <TouchableOpacity onPress={handleExpand} style={styles.button}>
              <Feather
                name={expanded ? "chevron-up" : "chevron-down"}
                size={18}
                color={myTheme.primary}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  header: {
    gap: 8,
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
  },
  contentContainer: {
    position: "relative",
    marginTop: 8,
  },
  content: {
    overflow: "hidden",
  },
  contentCollapsed: {
    maxHeight: 176, // Approximately equivalent to max-h-44 (11rem)
  },
  contentExpanded: {
    maxHeight: null,
  },
  gradientOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 48,
    backgroundColor: "transparent", // You'll need to implement gradient separately
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    bottom: 0,
  },
  relative: {
    position: "relative",
  },
  absolute: {
    position: "absolute",
  },
  button: {
    marginTop: 8,
    padding: 8,
  },
});

export default OrderGeneral;
