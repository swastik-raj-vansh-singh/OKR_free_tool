/**
 * User ID Manager
 * Handles persistent user ID storage and retrieval
 */

const STORAGE_KEY = 'okr_user_id'

/**
 * Generate a unique user ID
 */
export function generateUserId(): string {
  const randomPart = Math.random().toString(36).substring(2, 9)
  const timestamp = Date.now()
  return `user_${randomPart}_${timestamp}`
}

/**
 * Get existing user ID from localStorage or create a new one
 */
export function getPersistentUserId(): string {
  // Check if we're in browser environment
  if (typeof window === 'undefined') return generateUserId()

  // Try to get existing user ID from localStorage
  let userId = localStorage.getItem(STORAGE_KEY)

  // If no user ID exists, generate a new one and save it
  if (!userId) {
    userId = generateUserId()
    localStorage.setItem(STORAGE_KEY, userId)
    console.log('🆕 Generated new persistent user ID:', userId)
  } else {
    console.log('♻️ Retrieved existing user ID:', userId)
  }

  return userId
}

/**
 * Clear user ID from localStorage (for testing purposes)
 */
export function clearUserId(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
    console.log('🗑️ User ID cleared from localStorage')
  }
}

/**
 * Get user ID without creating one (returns null if doesn't exist)
 */
export function getUserIdIfExists(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEY)
}

/**
 * Set a specific user ID (useful for migrations or imports)
 */
export function setUserId(userId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, userId)
    console.log('💾 User ID set to:', userId)
  }
}
