import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { ResultEnum } from "@/types/enum";
import { myTheme } from "@/constants";

interface ResultProps {
  status: ResultEnum;
  title: string;
  description: string;
  leftButtonText: string;
  rightButtonText: string;
  leftButtonAction: () => void;
  rightButtonAction: () => void;
}

export default function Result({
  title,
  description,
  leftButtonAction,
  leftButtonText,
  rightButtonAction,
  rightButtonText,
  status,
}: ResultProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Success or Failure Icon */}
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor:
                status === ResultEnum.SUCCESS
                  ? myTheme.emerald[500]
                  : "transparent",
            },
          ]}
        >
          {status === ResultEnum.SUCCESS ? (
            <MaterialIcons name="check" size={40} color="white" />
          ) : (
            <MaterialIcons
              name="sentiment-dissatisfied"
              size={50}
              color={myTheme.red[500]}
            />
          )}
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          <Text
            style={[
              styles.title,
              status === ResultEnum.SUCCESS ? styles.success : styles.failed,
            ]}
          >
            {title}
          </Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.outlineButton]}
            onPress={leftButtonAction}
          >
            <Text style={[styles.buttonText, styles.outlineButtonText]}>
              {leftButtonText}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor:
                  status === ResultEnum.SUCCESS
                    ? myTheme.emerald[500]
                    : myTheme.red[500],
              },
            ]}
            onPress={rightButtonAction}
          >
            <Text style={styles.buttonText}>{rightButtonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  success: { color: myTheme.green[500] },
  failed: { color: myTheme.red[500] },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "white",
    padding: 24,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
    alignItems: "center",
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: myTheme.primary,
  },
  outlineButtonText: {
    color: myTheme.primary,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
