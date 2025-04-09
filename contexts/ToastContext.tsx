"use client";

import {
  createContext,
  useState,
  useContext,
  useCallback,
  type ReactNode,
  useEffect,
} from "react";
import { Incubator, Colors } from "react-native-ui-lib";
import { setGlobalToast } from "@/utils";
import { myTheme } from "@/constants";
import { hexToRgba } from "@/utils/color";

// Define toast types
export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastAction {
  label: string;
  onPress: () => void;
}

// Define toast context interface
interface ToastContextType {
  showToast: (
    message: string,
    type?: ToastType,
    duration?: number,
    action?: ToastAction
  ) => void;
  hideToast: () => void;
}

// Create context with default values
const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
  hideToast: () => {},
});

// Define props for ToastProvider
interface ToastProviderProps {
  children: ReactNode;
}

// Toast colors based on type
const toastColors = {
  success: myTheme.green[100],
  error: myTheme.red[100],
  info: myTheme.blue[100],
  warning: myTheme.yellow[100],
};
const textColors = {
  success: myTheme.green[500],
  error: myTheme.red[500],
  info: myTheme.blue[500],
  warning: myTheme.yellow[500],
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("info");
  const [duration, setDuration] = useState(3000);
  const [action, setAction] = useState<ToastAction | undefined>(undefined);

  // Function to show toast
  const showToast = useCallback(
    (
      message: string,
      type: ToastType = "info",
      duration = 3000,
      action?: ToastAction
    ) => {
      setMessage(message);
      setType(type);
      setDuration(duration);
      setAction(action);
      setVisible(true);
    },
    []
  );

  // Function to hide toast
  const hideToast = useCallback(() => {
    setVisible(false);
  }, []);

  // Set global toast function for use outside of React components
  useEffect(() => {
    setGlobalToast(showToast);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Incubator.Toast
        visible={visible}
        position={"top"}
        message={message}
        backgroundColor={toastColors[type]}
        messageStyle={{ color: textColors[type] }}
        onDismiss={hideToast}
        autoDismiss={duration}
        action={action}
        zIndex={1000}
        style={{
          marginTop: 50,
          width: "90%",
          alignSelf: "center",
          borderRadius: 6,
        }}
      />
    </ToastContext.Provider>
  );
}

// Custom hook to use toast
export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
