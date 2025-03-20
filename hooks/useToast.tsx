import { myTheme } from "@/constants";
import { FontAwesome6 } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";
import { Text } from "react-native-ui-lib";
import { toast } from "sonner";

type ToastOptions = {
  message: string;
  description?: string;
  duration?: number;
  onClose?: () => void;
  isShowDescription?: boolean;
};

export const useToast = () => {
  const { t } = useTranslation();
  const successToast = ({
    message,
    description,
    duration,
    onClose,
  }: ToastOptions) => {
    toast.success(message, {
      description: (
        <Text style={styles.textSuccess}>
          {description || t("toast.success")}
        </Text>
      ),
      icon: <FontAwesome6 name="check-circle" size={20} />,
      duration,
      onDismiss: onClose,
    });
  };

  const errorToast = ({
    message,
    description,
    duration,
    onClose,
    isShowDescription = true,
  }: ToastOptions) => {
    toast.error(message, {
      description: (
        <Text style={styles.textError}>
          {isShowDescription && (description || t("toast.error"))}
        </Text>
      ),
      duration,
      onDismiss: onClose,
      icon: <Feather name="x-circle" size={20} />,
    });
  };

  const warningToast = ({
    message,
    description,
    duration,
    onClose,
  }: ToastOptions) => {
    toast.warning(message, {
      description: (
        <Text style={styles.textWarning}>
          {description || t("toast.warning")}
        </Text>
      ),
      duration,
      onDismiss: onClose,
      icon: <Feather name="alert-circle" size={20} />,
    });
  };

  const infoToast = ({
    message,
    description,
    duration,
    onClose,
  }: ToastOptions) => {
    toast.info(message, {
      description: (
        <Text style={styles.textInfo}>{description || t("toast.info")}</Text>
      ),
      duration,
      onDismiss: onClose,
    });
  };

  return {
    infoToast,
    successToast,
    errorToast,
    warningToast,
  };
};

const styles = StyleSheet.create({
  textSuccess: {
    color: myTheme.green[500],
  },
  textError: { color: myTheme.red[500] },
  textWarning: { color: myTheme.yellow[500] },
  textInfo: { color: myTheme.blue[500] },
});
