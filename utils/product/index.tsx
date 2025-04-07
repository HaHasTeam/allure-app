import { ICartByBrand, ICartItem } from '@/types/cart'
import { IClassification, IClassificationWithSecondLevel } from '@/types/classification'
import { StatusEnum } from '@/types/enum'

/**
 * Checks if the product classification is active.
 * @param productClassification - The current product classification to check.
 * @param productClassifications - List of product classifications to compare against.
 * @returns True if the product classification is active; false otherwise.
 */
export function checkCurrentProductClassificationHide(
  productClassification: IClassification | null,
  productClassifications: IClassification[] | [],
): boolean {
  if (!productClassification || !productClassifications) return false

  // Check if the title doesn't exist in productClassifications or if status is not active
  // const titleDoesNotExist = !productClassifications.some((item) => item?.title === productClassification?.title)
  const isStatusNotActive = productClassification?.status !== StatusEnum.ACTIVE
  console.log(isStatusNotActive)
  // return titleDoesNotExist || isStatusNotActive
  return isStatusNotActive
}

/**
 * Checks if the product classification is active.
 * @param productClassification - The current product classification to check.
 * @param productClassifications - List of product classifications to compare against.
 * @returns True if the product classification is active; false otherwise.
 */
export function checkCurrentProductClassificationActive(
  productClassification: IClassification | null,
  productClassifications: IClassification[] | [],
): boolean {
  if (!productClassification || !productClassifications) return false

  // Check if the title exists in productClassifications or status is active or if quantity > 0
  const isQuantityPositive = productClassification?.quantity > 0

  return !checkCurrentProductClassificationHide(productClassification, productClassifications) && isQuantityPositive
}

/**
 * Checks if at least one classification in the list is ACTIVE.
 * @param classifications - List of product classifications to check.
 * @returns True if at least one classification is ACTIVE; false otherwise.
 */
export function hasActiveClassification(classifications: IClassification[] | []): boolean {
  if (!classifications || classifications.length === 0) return false

  return classifications.some((classification) => classification?.status === StatusEnum.ACTIVE)
}

/**
 * Checks if at least one classification in the list has a quantity greater than 0.
 * @param classifications - List of product classifications to check.
 * @returns True if at least one classification has quantity > 0; false otherwise.
 */
export function hasClassificationWithQuantity(classifications: IClassification[] | []): boolean {
  if (!classifications || classifications.length === 0) return false

  return classifications.some((classification) => (classification?.quantity ?? 0) > 0)
}

/**
 * Finds the product classification with the minimum price.
 * @param {Array} classifications - List of product classifications.
 * @returns {Object|null|IClassification} The classification with the minimum price, or null if the list is empty.
 */
export const getCheapestClassification = (classifications: IClassification[]) => {
  if (!classifications || classifications.length === 0) return null

  return classifications.reduce(
    (cheapest, current) => {
      // Ensure both current and cheapest have a defined price before comparison
      if (current?.price !== undefined && (cheapest?.price === undefined || current.price < cheapest.price)) {
        return current
      }
      return cheapest
    },
    null as IClassification | null,
  )
}

/**
 * Utility to validate the structure of a classification object.
 * @param {IClassification} classification - The classification object to validate.
 * @returns {boolean} - True if the object is valid, false otherwise.
 */
export const isValidClassification = (classification: IClassification) => {
  return typeof classification === 'object' && classification !== null && typeof classification.title === 'string'
}

/**
 * Utility to filter classifications based on a predicate.
 * @param {IClassification[]} classifications - Array of classification objects.
 * @param {(classification: IClassification) => boolean} predicate - Filter predicate function.
 * @returns {IClassification[]} - Filtered classifications.
 */
export const filterClassifications = (
  classifications: IClassification[],
  predicate: (classification: IClassification) => boolean,
) => {
  return classifications.filter(predicate)
}

/**
 * Utility to extract unique first-level categories from classifications.
 * @param {IClassification[]} classifications - Array of classification objects.
 * @returns {string[]} - Array of unique first-level categories.
 */
export const getUniqueFirstLevels = (classifications: IClassification[]) => {
  const firstLevels = classifications.map((classification) => {
    const [firstLevel] = classification.title.split('-')
    return firstLevel
  })
  return [...new Set(firstLevels)]
}

/**
 * Utility to get all classifications under a specific first-level category.
 * @param {Record<string, IClassification[]>} grouped - Grouped classifications object.
 * @param {string} firstLevel - The first-level category to filter by.
 * @returns {IClassification[]} - Classifications under the given first-level category.
 */
export const getClassificationsByFirstLevel = (grouped: Record<string, IClassification[]>, firstLevel: string) => {
  return grouped[firstLevel] || []
}

/**
 * Utility to count classifications within each first-level category.
 * @param {Record<string, IClassification[]>} grouped - Grouped classifications object.
 * @returns {Record<string, number>} - Object with counts per first-level category.
 */
export const countClassificationsByFirstLevel = (grouped: Record<string, IClassification[]>) => {
  const counts: Record<string, number> = {}
  for (const [key, classifications] of Object.entries(grouped)) {
    counts[key] = classifications.length
  }
  return counts
}

/**
 * Main parse function to group classifications by first-level category.
 * @param {IClassification[]} classifications - Array of classification objects.
 * @returns {Record<string, IClassification[]>} - Grouped classifications.
 */
export const parseClassifications = (
  classifications: IClassification[],
): Record<string, IClassificationWithSecondLevel[]> => {
  const grouped: Record<string, IClassificationWithSecondLevel[]> = {}
  classifications.forEach((classification) => {
    if (!isValidClassification(classification)) {
      throw new Error(`Invalid classification object: ${JSON.stringify(classification)}`)
    }
    const [firstLevel, secondLevel] = classification.title.split('-')
    if (!grouped[firstLevel]) {
      grouped[firstLevel] = []
    }
    grouped[firstLevel].push({ ...classification, secondLevel })
  })
  return grouped
}

export function hasPreOrderProduct(products: ICartItem[]): boolean {
  return products.some((product) => product.productClassification?.preOrderProduct != null)
}

export function flattenObject(data: ICartByBrand | null): ICartItem[] {
  const result: ICartItem[] = []

  for (const brandName in data) {
    const items = data[brandName]
    items.forEach((item: ICartItem) => {
      result.push(item)
    })
  }

  return result
}
