import i18next from 'i18next'

const messageMap: Record<string, string> = {
  'Invalid email': 'backendError.invalidEmail',
}
export const translateError = (message: string) => i18next.t(messageMap[message] ?? message)
