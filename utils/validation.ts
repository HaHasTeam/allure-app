export const validatePrice = (minPrice: string, maxPrice: string) => {
  const min = parseFloat(minPrice)
  const max = parseFloat(maxPrice)

  if (minPrice && isNaN(min)) {
    return 'Minimum price must be a valid number.'
  }
  if (maxPrice && isNaN(max)) {
    return 'Maximum price must be a valid number.'
  }
  if (min < 0 || max < 0) {
    return 'Price values must be greater than or equal to 0.'
  }
  if (minPrice && maxPrice && min > max) {
    return 'Minimum price cannot be greater than maximum price.'
  }
  return null
}
