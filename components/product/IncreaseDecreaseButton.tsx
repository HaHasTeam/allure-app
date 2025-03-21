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
            (isDecreaseDisabled || isProcessing) && styles.buttonDisabled,
          ]}
          disabled={isIncreaseDisabled || isProcessing}
          onPress={onIncrease}
        >
          <AntDesign name="plus" size={12} iconStyle={styles.icon} />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          editable={isProcessing}
          onChangeText={() => handleInputChange}
          value={inputValue}
          keyboardType="numeric"
        />
        <TouchableOpacity
          style={[
            styles.button,
            (isDecreaseDisabled || isProcessing) && styles.buttonDisabled,
          ]}
          disabled={isDecreaseDisabled || isProcessing}
          onPress={onDecrease}
        >
          <AntDesign name="minus" size={12} iconStyle={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default IncreaseDecreaseButton;

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
  },
  button: {
    borderWidth: 1,
    borderColor: hexToRgba(myTheme.secondary, 0.3),
    width: 40,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    fontWeight: "bold",
    color: myTheme.secondaryForeground,
    alignItems: "center",
    backgroundColor: hexToRgba(myTheme.secondary, 0.3),
  },
  icon: { fontWeight: "bold", color: myTheme.secondaryForeground },
  buttonDisabled: {
    borderColor: myTheme.gray[100],
    color: myTheme.gray[400],
  },
  input: {
    width: 40,
    borderWidth: 1,
    color: myTheme.secondaryForeground,
    fontWeight: 600,
    borderColor: myTheme.gray[300],
    height: 30,
    borderRadius: 15,
    fontSize: 14,
    textAlign: "center",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});
