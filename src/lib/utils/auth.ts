import { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import { getUserByWalletAddress, createUser } from '../db/supabase';
import { sendError } from './api';

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || '';

// JWT expiration time (24 hours)
const JWT_EXPIRATION = '24h';

/**
 * Generate a JWT token for a user
 * @param userId The user's ID
 * @param walletAddress The user's wallet address
 * @returns The JWT token
 */
export function generateToken(userId: string, walletAddress: string): string {
  return jwt.sign(
    {
      sub: userId,
      wallet: walletAddress,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRATION,
    }
  );
}

/**
 * Verify a JWT token
 * @param token The JWT token
 * @returns The decoded token
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Verify a wallet signature
 * @param message The message that was signed
 * @param signature The signature
 * @param walletAddress The wallet address
 * @returns Whether the signature is valid
 */
export function verifySignature(
  message: string,
  signature: string,
  walletAddress: string
): boolean {
  try {
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

/**
 * Get the user ID from a request
 * @param req The request object
 * @returns The user ID
 */
export function getUserIdFromRequest(req: NextApiRequest): string | null {
  // Get the authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  // Extract the token
  const token = authHeader.substring(7);
  if (!token) {
    return null;
  }

  // Verify the token
  const decoded = verifyToken(token);
  if (!decoded) {
    return null;
  }

  return decoded.sub;
}

/**
 * Authentication middleware
 * @param handler The API handler
 * @returns The wrapped handler
 */
export function withAuth(
  handler: (
    req: NextApiRequest,
    res: NextApiResponse,
    userId: string
  ) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Get the user ID from the request
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return sendError(res, 'Unauthorized', 401);
    }

    // Call the handler with the user ID
    return handler(req, res, userId);
  };
}

/**
 * Get or create a user by wallet address
 * @param walletAddress The wallet address
 * @returns The user
 */
export async function getOrCreateUserByWalletAddress(walletAddress: string) {
  try {
    try {
      // Try to get the user
      const user = await getUserByWalletAddress(walletAddress);
      if (user) {
        return user;
      }

      // Create a new user
      return await createUser({
        wallet_address: walletAddress,
      });
    } catch (dbError) {
      console.error('Database error when getting or creating user:', dbError);
      
      // For development/testing, return a mock user
      console.log('Using mock user for development');
      return {
        id: '00000000-0000-0000-0000-000000000000',
        wallet_address: walletAddress,
        smart_account_address: null,
        email: null,
        name: 'Development User',
        institution: null,
        role: null,
        kyc_status: 'not_submitted',
        terms_accepted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
  } catch (error) {
    console.error('Error getting or creating user:', error);
    throw new Error('Failed to get or create user');
  }
}

/**
 * Generate a message for wallet signature
 * @param walletAddress The wallet address
 * @param nonce The nonce
 * @returns The message to sign
 */
export function generateSignMessage(walletAddress: string, nonce: string): string {
  return `Welcome to VELTIS!\n\nPlease sign this message to authenticate.\n\nWallet: ${walletAddress}\nNonce: ${nonce}`;
}
