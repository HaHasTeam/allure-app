import { myTheme } from "@/constants";
import { hexToRgba } from "@/utils/color";
import { AntDesign } from "@expo/vector-icons";
import { TextInput, View } from "react-native";
import { StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native";

interface IncreaseDecreaseButtonProps {
  onIncrease: () => void;
  onDecrease: () => void;
  isIncreaseDisabled: boolean;
  isDecreaseDisabled: boolean;
  isProcessing: boolean;
  inputValue: string;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

const IncreaseDecreaseButton = ({
  inputValue,
  handleInputChange,
  onIncrease,
  onDecrease,
  isIncreaseDisabled,
  isDecreaseDisabled,
  isProcessing,
  onBlur,
  onKeyDown,
}: IncreaseDecreaseButtonProps) => {
  return (
    <View>
      <View style={styles.container}>
        <TouchableOpacity
          style={[
            styles.button,
            isDecreaseDisabled || isProcessing
              ? styles.buttonDisabled
              : styles.normalButton,
          ]}
          disabled={isDecreaseDisabled || isProcessing}
          onPress={onDecrease}
        >
          <AntDesign
            name="minus"
            color={
              isDecreaseDisabled || isProcessing
                ? myTheme.gray[400]
                : myTheme.secondaryForeground
            }
            size={12}
            iconStyle={[
              styles.icon,
              (isDecreaseDisabled || isProcessing) && styles.iconDisabled,
            ]}
          />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          editable={isProcessing}
          onChangeText={() => handleInputChange}
          value={inputValue}
          textAlignVertical={"center"}
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={[
            styles.button,
            isIncreaseDisabled || isProcessing
              ? styles.buttonDisabled
              : styles.normalButton,
          ]}
          disabled={isIncreaseDisabled || isProcessing}
          onPress={onIncrease}
        >
          <AntDesign
            name="plus"
            size={12}
            color={
              isIncreaseDisabled || isProcessing
                ? myTheme.gray[400]
                : myTheme.secondaryForeground
            }
            iconStyle={[
              styles.icon,
              (isIncreaseDisabled || isProcessing) && styles.iconDisabled,
            ]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default IncreaseDecreaseButton;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  button: {
    borderWidth: 1,
    borderColor: hexToRgba(myTheme.secondary, 0.3),
    width: 30,
    height: 34,
    borderRadius: 6,
    justifyContent: "center",
    fontWeight: "bold",
    color: myTheme.secondaryForeground,
    alignItems: "center",
  },
  normalButton: {
    backgroundColor: hexToRgba(myTheme.secondary, 0.3),
  },
  icon: { fontWeight: "bold" },
  buttonDisabled: {
    borderColor: myTheme.gray[200],
    opacity: 0.6,
    color: myTheme.gray[400],
  },
  iconDisabled: {
    color: myTheme.gray[400],
  },
  textContent: {
    padding: 0,
    margin: 0,
    lineHeight: 14,
  },
  input: {
    width: 60,
    borderWidth: 1,
    color: myTheme.secondaryForeground,
    fontWeight: 600,
    borderColor: myTheme.gray[300],
    borderRadius: 6,
    fontSize: 12,
    textAlign: "center",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 0,
    marginTop: 0,
    paddingVertical: 0,
    height: 34,
    textAlignVertical: "center",
  },
});
