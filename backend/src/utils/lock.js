/**
 * Mock lock implementation for development.
 * In production, use Redis for distributed locking.
 */

/**
 * Acquire a lock (mock implementation).
 * @param {string} resource - The resource identifier to lock.
 * @param {number} ttl - Time to live in milliseconds.
 * @returns {Promise<string>} - Returns lockId.
 */
export const acquireLock = async (resource, ttl = 5000) => {
  const lockId = Date.now().toString() + Math.random().toString();
  // In-memory mock lock - always succeeds
  return lockId;
};

/**
 * Release a lock (mock implementation).
 * @param {string} resource - The resource identifier.
 * @param {string} lockId - The lock ID returned by acquireLock.
 */
export const releaseLock = async (resource, lockId) => {
  // No-op for mock implementation
  return;
};
