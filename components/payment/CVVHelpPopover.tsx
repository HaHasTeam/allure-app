import { Feather } from '@expo/vector-icons'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View, Image, ScrollView } from 'react-native'
import { Button, Colors, Dialog, TouchableOpacity } from 'react-native-ui-lib'

// You'll need to import your image properly for React Native
// This assumes you have the image in your assets folder
const cvvImage = require('@/assets/images/cvv.jpg')

export default function CVVHelpPopover() {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)

  return (
    <>
      <TouchableOpacity onPress={() => setVisible(true)}>
        <Feather name='help-circle' size={16} color={Colors.grey40} />
      </TouchableOpacity>

      <Dialog visible={visible} onDismiss={() => setVisible(false)} containerStyle={styles.dialogContainer}>
        <View style={styles.popoverContent}>
          <ScrollView style={styles.scrollArea}>
            <Text style={styles.title}>{t('wallet.cvvFull')}</Text>
            <View style={styles.imageContainer}>
              <Image source={cvvImage} style={styles.image} resizeMode='contain' />
            </View>
            <Text style={styles.description}>{t('wallet.cvvDescription')}</Text>
          </ScrollView>

          <Button label={t('button.close')} onPress={() => setVisible(false)} style={styles.closeButton} />
        </View>
      </Dialog>
    </>
  )
}

const styles = StyleSheet.create({
  dialogContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    width: '80%',
    maxHeight: '80%'
  },
  popoverContent: {
    padding: 16
  },
  scrollArea: {
    maxHeight: 300
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8
  },
  imageContainer: {
    width: '100%',
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8
  },
  image: {
    width: '100%',
    height: '100%'
  },
  description: {
    fontSize: 14,
    color: Colors.grey40,
    lineHeight: 20,
    textAlign: 'center'
  },
  closeButton: {
    marginTop: 16
  }
})
