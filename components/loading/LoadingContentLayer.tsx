import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import LoadingIcon from "./LoadingIcon";

type Props = {
  label?: string;
  style?: object;
};

const LoadingContentLayer: React.FC<Props> = ({ label, style }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.overlay, style, { opacity: fadeAnim }]}>
      <View>
        <LoadingIcon label={label} color="primaryBackground" />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    zIndex: 10,
  },
});

export default LoadingContentLayer;
