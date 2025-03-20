import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";

type LoadingSpinnerProps = {
  size?: "small" | "medium" | "large";
  color?:
    | "primary"
    | "secondary"
    | "accent"
    | "white"
    | "black"
    | "primaryBackground";
  label?: string;
  style?: object;
};

export default function LoadingIcon({
  size = "medium",
  color = "primary",
  label,
  style,
}: LoadingSpinnerProps) {
  const sizeMap = {
    small: "small",
    medium: "large",
    large: 50,
  };

  const colorMap = {
    primary: "#007bff",
    secondary: "#6c757d",
    accent: "#17a2b8",
    white: "#ffffff",
    black: "#000000",
    primaryBackground: "#007bff",
  };

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={sizeMap[size]} color={colorMap[color]} />
      {!!label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  label: {
    marginTop: 8,
    fontSize: 14,
    color: "#000",
  },
});
