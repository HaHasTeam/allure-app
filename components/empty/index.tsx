import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

import { myTheme } from "@/constants";
import { Image } from "react-native";

// Import images - in React Native, you need to require images
const emptyInbox = require("@/assets/images/EmptyInbox.png");

type EmptyProps = {
  title: string;
  description: string;
  icon?: any;
  linkText?: string;
  link?: "/" | "/(app)/(profile)/orders";
};

const Empty = ({ title, description, icon, linkText, link }: EmptyProps) => {
  const router = useRouter();

  const handleNavigation = () => {
    if (link) {
      router.push(link);
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={icon ? icon : emptyInbox} style={styles.image} />
      </View>
      <View style={styles.contentContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
        {linkText && link && (
          <TouchableOpacity style={styles.button} onPress={handleNavigation}>
            <Text style={styles.buttonText}>{linkText}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "50%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    resizeMode: "contain",
  },
  contentContainer: {
    alignItems: "center",
    gap: 16,
  },
  textContainer: {
    gap: 8,
  },
  title: {
    fontWeight: "600",
    fontSize: 18,
    color: myTheme.primary,
    textAlign: "center",
  },
  description: {
    color: myTheme.gray[600],
    textAlign: "center",
  },
  button: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: myTheme.primary,
  },
  buttonText: {
    color: myTheme.primaryForeground,
  },
});

export default Empty;
