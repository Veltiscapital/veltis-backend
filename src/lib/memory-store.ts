/**
 * In-memory store for nonces
 * 
 * This is a simple in-memory store for nonces that is used as a fallback
 * when the database is not available. In a production environment, this
 * should be replaced with a more robust solution like Redis.
 */

// Interface for memory nonce
export interface MemoryNonce {
  nonce: string;
  expires: number;
}

// Declare the global variable to ensure it's shared across API routes
declare global {
  var _memoryNonces: Map<string, MemoryNonce> | undefined;
}

// Initialize the memory store if it doesn't exist
if (!global._memoryNonces) {
  global._memoryNonces = new Map<string, MemoryNonce>();
  
  // Set up a cleanup interval to remove expired nonces
  if (typeof setInterval !== 'undefined') {
    setInterval(() => {
      const now = Date.now();
      const nonces = global._memoryNonces;
      if (nonces) {
        for (const [address, data] of nonces.entries()) {
          if (data.expires < now) {
            nonces.delete(address);
          }
        }
      }
    }, 15 * 60 * 1000); // Clean up every 15 minutes
  }
}

/**
 * Get the shared memory nonces store
 */
export const getMemoryNonces = (): Map<string, MemoryNonce> => {
  if (!global._memoryNonces) {
    global._memoryNonces = new Map<string, MemoryNonce>();
  }
  return global._memoryNonces;
};

/**
 * Store a nonce in memory
 * @param walletAddress The wallet address
 * @param nonce The nonce value
 * @param expiryMinutes Expiry time in minutes (default: 15)
 */
export const storeMemoryNonce = (
  walletAddress: string, 
  nonce: string, 
  expiryMinutes: number = 15
): void => {
  const expires = Date.now() + expiryMinutes * 60 * 1000;
  getMemoryNonces().set(walletAddress, { nonce, expires });
};

/**
 * Get a nonce from memory
 * @param walletAddress The wallet address
 * @returns The nonce or null if not found or expired
 */
export const getMemoryNonce = (walletAddress: string): string | null => {
  const data = getMemoryNonces().get(walletAddress);
  if (data && data.expires > Date.now()) {
    return data.nonce;
  }
  return null;
};

/**
 * Delete a nonce from memory
 * @param walletAddress The wallet address
 */
export const deleteMemoryNonce = (walletAddress: string): void => {
  getMemoryNonces().delete(walletAddress);
}; 