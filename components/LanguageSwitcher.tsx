import { AntDesign } from '@expo/vector-icons'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native'

import { myTheme } from '@/constants'

const LanguageSwitcher = () => {
  const { i18n } = useTranslation()
  const supportedLngs = i18n.options.supportedLngs || []
  const [isModalVisible, setModalVisible] = useState(false)

  const toggleModal = () => setModalVisible(!isModalVisible)

  const handleChangeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    setModalVisible(false)
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={toggleModal}>
        <View style={styles.languageContainer}>
          {supportedLngs
            .filter((lng) => lng !== 'cimode')
            .map((lng) => (
              <TouchableOpacity
                key={lng}
                style={[styles.languageOption, i18n.resolvedLanguage === lng && styles.selectedLanguage]}
                onPress={() => handleChangeLanguage(lng)}
              >
                <Text style={[styles.languageText, i18n.resolvedLanguage === lng && styles.selectedLanguageText]}>
                  {lng.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
        </View>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative'
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#f0f0f0'
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500'
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  languageContainer: {
    width: '100%'
  },
  languageOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 4,
    marginBottom: 8,
    width: '100%',
    backgroundColor: '#f5f5f5'
  },
  selectedLanguage: {
    backgroundColor: myTheme.primary
  },
  languageText: {
    fontSize: 16,
    color: '#333'
  },
  selectedLanguageText: {
    color: 'white',
    fontWeight: 'bold'
  }
})

export default LanguageSwitcher
