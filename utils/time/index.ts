import { formatDate, formatDistanceToNow } from 'date-fns'
import type { Timestamp } from 'firebase/firestore'

/**
 * Converts milliseconds to days, rounding up to the next whole number
 * @param milliseconds The time in milliseconds
 * @returns The number of days (rounded up)
 */
export const millisecondsToRoundedDays = (milliseconds: number): number => {
  const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000

  const days = milliseconds / MILLISECONDS_PER_DAY

  return Math.ceil(days)
}

// Define a union type for all possible timestamp formats
type TimestampType = Timestamp | Date | number | string | undefined | null

/**
 * Safely converts any timestamp format to a Date object
 * @param timestamp The timestamp to convert (can be Firestore Timestamp, number, Date, or string)
 * @returns A JavaScript Date object
 */
const getDateFromTimestamp = (timestamp: TimestampType): Date => {
  if (!timestamp) return new Date()

  if (typeof timestamp === 'object' && 'toDate' in timestamp) {
    return timestamp.toDate()
  }

  if (timestamp instanceof Date) {
    return timestamp
  }

  if (typeof timestamp === 'number') {
    // If timestamp is in seconds (Firestore sometimes uses seconds), convert to milliseconds
    return new Date(timestamp > 9999999999 ? timestamp : timestamp * 1000)
  }

  return new Date(timestamp)
}

/**
 * Formats a timestamp based on how recent it is
 * @param timestamp The timestamp to format (can be Firestore Timestamp, number, Date, or string)
 * @returns A formatted time string
 */
export const formatMessageTime = (timestamp: TimestampType): string => {
  const date = getDateFromTimestamp(timestamp)
  const now = new Date()

  // If the message is from today, show the time
  if (date.toDateString() === now.toDateString()) {
    return formatDate(date, 'h:mm a')
  }

  // If the message is from this week, show the day
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffInDays < 7) {
    return formatDate(date, 'EEE h:mm a')
  }

  // Otherwise, show the date
  return formatDate(date, 'MMM d, yyyy')
}

/**
 * Formats a timestamp into a relative time string (e.g., "2 hours ago")
 * @param timestamp The timestamp to format (can be Firestore Timestamp, number, Date, or string)
 * @returns A relative time string
 */
export const formatRelativeTime = (timestamp: TimestampType): string => {
  const date = getDateFromTimestamp(timestamp)
  return formatDistanceToNow(date, { addSuffix: true })
}
