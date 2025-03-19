import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { AntDesign } from "@expo/vector-icons";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const supportedLngs = i18n.options.supportedLngs || [];
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => setModalVisible(!isModalVisible);

  const handleChangeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={toggleModal}>
        <Text style={styles.buttonText}>
          {i18n.resolvedLanguage?.toUpperCase()}
        </Text>
        <AntDesign name="caretdown" size={24} color="black" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={toggleModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={toggleModal}
        >
          <View style={styles.modalContent}>
            {supportedLngs
              .filter((lng) => lng !== "cimode")
              .map((lng) => (
                <TouchableOpacity
                  key={lng}
                  style={[
                    styles.languageOption,
                    i18n.resolvedLanguage === lng && styles.selectedLanguage,
                  ]}
                  onPress={() => handleChangeLanguage(lng)}
                >
                  <Text
                    style={[
                      styles.languageText,
                      i18n.resolvedLanguage === lng &&
                        styles.selectedLanguageText,
                    ]}
                  >
                    {lng.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#f0f0f0",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 200,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  languageOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginBottom: 8,
    backgroundColor: "#f5f5f5",
  },
  selectedLanguage: {
    backgroundColor: "#1e88e5",
  },
  languageText: {
    fontSize: 16,
    color: "#333",
  },
  selectedLanguageText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default LanguageSwitcher;
