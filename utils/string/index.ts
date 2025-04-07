export const minifyString = (str: string, length: number = 8) => {
  if (str.length > length) {
    return str.slice(0, length)
  }
  return str
}

export const minifyStringId = (str?: string): string => {
  if (!str) return ''
  return '#' + str.replace(/-/g, '').toUpperCase().slice(0, 10)
}

export const getDisplayString = (str: string): string => {
  return str.replace(/_/g, ' ').toLowerCase()
}
