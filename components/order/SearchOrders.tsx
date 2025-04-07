import { myTheme } from "@/constants";
import { hexToRgba } from "@/utils/color";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { GestureResponderEvent, View } from "react-native";
import { TextInput } from "react-native";
import { Text } from "react-native";
import { StyleSheet, TouchableOpacity } from "react-native";

interface SearchOrdersProps {
  onSearch?: (query: string) => void;
}

export default function SearchOrders({ onSearch }: SearchOrdersProps) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState<string>("");

  const handleInputChange = (text: string) => {
    setInputValue(text);
  };

  const handleSubmit = (event: GestureResponderEvent) => {
    event.preventDefault();
    onSearch?.(inputValue.trim());
  };

  const handleReset = () => {
    setInputValue("");
    onSearch?.("");
  };

  return (
    <View style={styles.formContainer}>
      <View style={styles.inputContainer}>
        <View style={styles.searchWrapper}>
          <Feather
            name="search"
            size={16}
            color={myTheme.mutedForeground}
            style={styles.searchIcon}
          />
          <TextInput
            value={inputValue}
            onChangeText={handleInputChange}
            inputMode="search"
            placeholder={t("search.orderPlaceholder")}
            placeholderTextColor="grey"
            style={styles.input}
          />
        </View>

        <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
          <Text style={styles.submitButtonText}>{t("search.orderButton")}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
          <Text style={styles.resetButtonText}>{t("search.reset")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    overflow: "hidden",
  },
  searchWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: myTheme.white,
    borderWidth: 1,
    borderColor: myTheme.border,
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  searchIcon: {
    marginLeft: 12,
  },
  input: {
    flex: 1,
    borderWidth: 0,
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: 12,
    textOverflow: "ellipsis",
  },
  submitButton: {
    backgroundColor: myTheme.primary,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  submitButtonText: {
    color: myTheme.primaryForeground,
    fontSize: 12,
    fontWeight: "500",
  },
  resetButton: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: hexToRgba(myTheme.primary, 0.4),
    borderRadius: 6,
    backgroundColor: myTheme.white,
  },
  resetButtonText: {
    color: myTheme.primary,
    fontSize: 12,
    fontWeight: "500",
  },
});
