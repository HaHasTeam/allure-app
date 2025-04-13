import * as Localization from 'expo-localization'
import i18n from 'i18next'
import moment from 'moment'
import { initReactI18next } from 'react-i18next'

// Import your translation files
import enTranslation from './locales/en/layout.json'
import viTranslation from './locales/vi/layout.json'

export const supportedLngs = ['en', 'vi']

// Get device language
const deviceLanguage = Localization.locale.split('-')[0]
const fallbackLng = supportedLngs.includes(deviceLanguage) ? deviceLanguage : 'vi'

const resources = {
  en: {
    layout: enTranslation
  },
  vi: {
    layout: viTranslation
  }
}

i18n.use(initReactI18next).init({
  resources,
  supportedLngs,
  ns: ['layout'],
  defaultNS: 'layout',
  fallbackLng: ['vi'],
  lng: fallbackLng,
  interpolation: {
    escapeValue: false,
    format: (value, format, lng) => {
      if (value instanceof Date) {
        const dateValue = value instanceof Date ? value : new Date(value)
        return moment(dateValue).format(format || 'DD/MM/YYYY HH:mm:ss')
      }

      if (format === 'currency') {
        const currency = lng === 'vi' ? 'VND' : 'VND' // Don't change currency per language
        return new Intl.NumberFormat('vi', {
          style: 'currency',
          currency
        }).format(value)
      }
      return value
    }
  }
})

export default i18n
